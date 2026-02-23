import { useState } from 'react'
import { X, Download, UserCheck, UserMinus } from 'lucide-react'

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
    const [checkInDate, setCheckInDate] = useState(new Date().toISOString().slice(0, 16))
    const [checkOutDate, setCheckOutDate] = useState('')

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
            checkInDate,
            checkOutDate,
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto border border-amber-100">
                <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-black text-gray-800 mb-1">{title}</h2>
                <p className="text-xs text-gray-400 font-medium mb-4">
                    {isOccupied ? 'Currently occupied' : 'Available for check-in'}
                </p>

                {isOccupied ? (
                    <div>
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl mb-4 space-y-2 border border-amber-100">
                            <label className="text-xs font-semibold text-gray-500 block uppercase tracking-wider">Current Guest</label>
                            <p className="text-lg font-black text-gray-800">{guest?.name || 'Unknown'}</p>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-white/60 rounded-lg p-2">
                                    <span className="text-gray-400 font-semibold block text-xs">Mobile</span>
                                    <span className="text-gray-700 font-medium">{guest?.mobile || '-'}</span>
                                </div>
                                <div className="bg-white/60 rounded-lg p-2">
                                    <span className="text-gray-400 font-semibold block text-xs">Payment</span>
                                    <span className="text-gray-700 font-medium">{guest?.paymentMode || 'CASH'}</span>
                                </div>
                            </div>
                        </div>

                        {!showBill ? (
                            <button
                                onClick={fetchBill}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all mb-2 shadow-lg shadow-amber-200/50 disabled:opacity-50 active:scale-[0.98]"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Loading...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <UserMinus className="w-4 h-4" />
                                        View Bill & Checkout
                                    </span>
                                )}
                            </button>
                        ) : (
                            <div className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
                                <h3 className="font-bold mb-3 text-gray-800 text-sm uppercase tracking-wider">Final Bill Summary</h3>
                                <div className="space-y-2 text-sm text-gray-700">
                                    <div className="flex justify-between py-1">
                                        <span>Stay ({billData?.nights} nights @ ₹{billData?.pricePerNight})</span>
                                        <span className="font-semibold">₹{billData?.accommodationTotal}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                                        <span className="font-semibold text-gray-800">Food Orders</span>
                                        <span className="font-bold text-gray-800">₹{billData?.foodTotal}</span>
                                    </div>

                                    {/* Detailed Food Items */}
                                    {billData?.orders && billData.orders.length > 0 && (
                                        <div className="pl-3 border-l-2 border-amber-200 mt-1 mb-2 space-y-1">
                                            {billData.orders.map((order: any) => {
                                                try {
                                                    const items = JSON.parse(order.items)
                                                    return items.map((item: any, idx: number) => {
                                                        if (typeof item === 'string') return null
                                                        return (
                                                            <div key={`${order.id}-${idx}`} className="flex justify-between text-xs text-gray-500">
                                                                <span>{item.name} × {item.qty}</span>
                                                                <span>₹{item.price * item.qty}</span>
                                                            </div>
                                                        )
                                                    })
                                                } catch (e) { return null }
                                            })}
                                        </div>
                                    )}

                                    <div className="flex justify-between font-black text-lg pt-3 border-t-2 border-gray-200 mt-3 text-gray-800">
                                        <span>Total to Pay</span>
                                        <span className="text-amber-600">₹{billData?.totalBill}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <button
                                        onClick={downloadBill}
                                        className="flex items-center justify-center gap-2 w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors active:scale-[0.98]"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </button>
                                    <button
                                        onClick={handleCheckOut}
                                        disabled={loading}
                                        className="flex items-center justify-center gap-2 w-full bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 disabled:opacity-50 transition-colors active:scale-[0.98]"
                                    >
                                        {loading ? (
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <UserMinus className="w-4 h-4" />
                                                Checkout
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleCheckIn} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Guest Name</label>
                            <input
                                type="text"
                                required
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-gray-800 font-medium bg-gray-50/50 transition-all placeholder:text-gray-400"
                                placeholder="Enter guest name"
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Mobile</label>
                                <input
                                    type="text"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-gray-800 font-medium bg-gray-50/50 transition-all placeholder:text-gray-400"
                                    placeholder="9876543210"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1.5">City</label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-gray-800 font-medium bg-gray-50/50 transition-all placeholder:text-gray-400"
                                    placeholder="e.g. Mumbai"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Check-in Date/Time</label>
                                <input
                                    type="datetime-local"
                                    value={checkInDate}
                                    onChange={(e) => setCheckInDate(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-gray-800 font-medium bg-gray-50/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Check-out Date (Plan)</label>
                                <input
                                    type="date"
                                    value={checkOutDate}
                                    onChange={(e) => setCheckOutDate(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-gray-800 font-medium bg-gray-50/50 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Payment Mode</label>
                            <select
                                value={paymentMode}
                                onChange={(e) => setPaymentMode(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-gray-800 font-medium transition-all"
                            >
                                <option value="CASH">Cash</option>
                                <option value="UPI">Online (UPI)</option>
                                <option value="CARD">Card</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 shadow-lg shadow-amber-200/50 active:scale-[0.98]"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <UserCheck className="w-4 h-4" />
                                    Complete Check-in
                                </span>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
