import { useState } from 'react'
import { X } from 'lucide-react'

interface CheckInModalProps {
    item: any
    onClose: () => void
    onUpdate: () => void
}

export function CheckInModal({ item, onClose, onUpdate }: CheckInModalProps) {
    const [guestName, setGuestName] = useState('')
    const [mobile, setMobile] = useState('')
    const [city, setCity] = useState('')
    const [paymentMode, setPaymentMode] = useState('CASH')
    const [loading, setLoading] = useState(false)
    const [showBill, setShowBill] = useState(false)
    const [billData, setBillData] = useState<any>(null)

    const isOccupied = item.status === 'OCCUPIED'
    const isRoom = !!item.roomNumber
    const title = isRoom ? item.roomNumber : `Bed ${item.bedNumber} (Floor ${item.floorNumber})`
    const guest = isOccupied && item.guests.length > 0 ? item.guests[0] : null

    const handleCheckIn = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!guestName) return
        setLoading(true)

        const payload = {
            name: guestName,
            mobile,
            city,
            paymentMode,
            roomId: isRoom ? item.id : undefined,
            dormBedId: !isRoom ? item.id : undefined
        }

        try {
            await fetch('/api/check-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            onUpdate()
            onClose()
        } catch (error) {
            alert('Check-in failed')
        } finally {
            setLoading(false)
        }
    }

    const fetchBill = async () => {
        if (!guest) return
        setLoading(true)
        try {
            const res = await fetch(`/api/guests/${guest.id}/bill`)
            const data = await res.json()
            setBillData(data)
            setShowBill(true)
        } catch (error) {
            alert('Failed to fetch bill')
        } finally {
            setLoading(false)
        }
    }

    const handleCheckOut = async () => {
        if (!confirm('Confirm Checkout and Payment?')) return
        setLoading(true)

        try {
            await fetch('/api/check-out', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: isRoom ? item.id : undefined,
                    dormBedId: !isRoom ? item.id : undefined
                })
            })
            onUpdate()
            onClose()
        } catch (error) {
            alert('Check-out failed')
        } finally {
            setLoading(false)
        }
    }

    const downloadBill = () => {
        if (!guest) return

        let billText = `PUSHKARSTAY HOSTEL BILL\n-----------------------\n`
        billText += `Guest: ${guest.name}\n`
        billText += `Date: ${new Date().toLocaleDateString()}\n\n`

        billText += `ACCOMMODATION\n`
        billText += `Stay: ${billData.nights} nights\n`
        billText += `Total: Rs. ${billData.accommodationTotal}\n\n`

        billText += `FOOD ORDERS\n`
        billData.orders?.forEach((order: any) => {
            try {
                const items = JSON.parse(order.items)
                if (Array.isArray(items) && typeof items[0] !== 'string') {
                    items.forEach((item: any) => {
                        billText += `- ${item.name} x ${item.qty} : Rs. ${item.price * item.qty}\n`
                    })
                }
            } catch (e) { }
        })
        billText += `Total: Rs. ${billData.foodTotal}\n\n`

        billText += `-----------------------\n`
        billText += `GRAND TOTAL: Rs. ${billData.totalBill}\n`
        billText += `-----------------------\n`
        billText += `Thank you for staying with us!`

        const blob = new Blob([billText], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Bill_${guest.name.replace(/\s+/g, '_')}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto border-2 border-yellow-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-black mb-4 text-black">{title}</h2>

                {isOccupied ? (
                    <div>
                        <div className="bg-yellow-50 p-4 rounded-lg mb-4 space-y-2 border border-yellow-100">
                            <label className="text-sm font-bold text-gray-600 block">Current Guest</label>
                            <p className="text-lg font-black text-black">{guest?.name || 'Unknown'}</p>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-600 font-bold block text-xs">Mobile</span>
                                    <span className="text-black font-medium">{guest?.mobile || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600 font-bold block text-xs">Payment</span>
                                    <span className="text-black font-medium">{guest?.paymentMode || 'CASH'}</span>
                                </div>
                            </div>
                        </div>

                        {!showBill ? (
                            <button
                                onClick={fetchBill}
                                disabled={loading}
                                className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition mb-2"
                            >
                                {loading ? 'Loading...' : 'View Bill & Checkout'}
                            </button>
                        ) : (
                            <div className="bg-yellow-50 p-4 rounded-lg mb-4 border border-yellow-200">
                                <h3 className="font-bold mb-2 text-black">Final Bill Summary</h3>
                                <div className="space-y-1 text-sm text-black">
                                    <div className="flex justify-between">
                                        <span>Stay ({billData?.nights} nights @ {billData?.pricePerNight})</span>
                                        <span>₹{billData?.accommodationTotal}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-black bg-yellow-100 p-2 rounded border border-yellow-200">
                                        <span className="font-bold">Food Orders Total</span>
                                        <span className="font-black">₹{billData?.foodTotal}</span>
                                    </div>

                                    {/* Detailed Food Items */}
                                    {billData?.orders && billData.orders.length > 0 && (
                                        <div className="pl-2 border-l-2 border-yellow-300 mt-1 mb-2 space-y-1">
                                            {billData.orders.map((order: any) => {
                                                try {
                                                    const items = JSON.parse(order.items)
                                                    return items.map((item: any, idx: number) => {
                                                        if (typeof item === 'string') {
                                                            return null // Hide legacy string items as per user request
                                                        }
                                                        return (
                                                            <div key={`${order.id}-${idx}`} className="flex justify-between text-xs text-black font-medium">
                                                                <span>{item.name} x {item.qty}</span>
                                                                <span>₹{item.price * item.qty}</span>
                                                            </div>
                                                        )
                                                    })
                                                } catch (e) { return null }
                                            })}
                                        </div>
                                    )}
                                    <div className="flex justify-between font-black text-lg pt-2 border-t border-yellow-200 mt-2 text-black">
                                        <span>Total to Pay</span>
                                        <span>₹{billData?.totalBill}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <button
                                        onClick={downloadBill}
                                        className="w-full bg-white border border-gray-300 text-black py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                                    >
                                        Download Bill
                                    </button>
                                    <button
                                        onClick={handleCheckOut}
                                        disabled={loading}
                                        className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 transition-colors"
                                    >
                                        {loading ? 'Processing...' : 'Confirm Checkout'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleCheckIn} className="space-y-4">
                        {/* Check-in Form Fields */}
                        <div>
                            <label className="block text-sm font-bold text-black mb-1">Guest Name</label>
                            <input
                                type="text"
                                required
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none text-black font-medium placeholder:text-gray-500"
                                placeholder="Enter guest name"
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-bold text-black mb-1">Mobile Number</label>
                                <input
                                    type="text"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none text-black font-medium placeholder:text-gray-500"
                                    placeholder="9876543210"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-black mb-1">City</label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none text-black font-medium placeholder:text-gray-500"
                                    placeholder="e.g. Mumbai"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-black mb-1">Payment Mode</label>
                            <select
                                value={paymentMode}
                                onChange={(e) => setPaymentMode(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 outline-none text-black font-medium"
                            >
                                <option value="CASH">Cash</option>
                                <option value="UPI">Online (UPI)</option>
                                <option value="CARD">Card</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Complete Check-in'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
