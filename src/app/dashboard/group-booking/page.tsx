'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Users, Check } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function GroupBookingPage() {
    const router = useRouter()
    const { data, error } = useSWR('/api/dashboard', fetcher)
    const [submitting, setSubmitting] = useState(false)

    // Form Details
    const [guestDetails, setGuestDetails] = useState({
        name: '',
        mobile: '',
        city: '',
        paymentMode: 'CASH'
    })

    // Selection
    const [selectedRooms, setSelectedRooms] = useState<number[]>([])
    const [selectedBeds, setSelectedBeds] = useState<number[]>([])

    if (error) return <div>Failed to load data</div>
    if (!data) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>

    const { rooms, dormBeds } = data
    const availableRooms = rooms.filter((r: any) => r.status === 'AVAILABLE')
    const availableBeds = dormBeds.filter((b: any) => b.status === 'AVAILABLE')

    const toggleRoom = (id: number) => {
        if (selectedRooms.includes(id)) {
            setSelectedRooms(selectedRooms.filter(r => r !== id))
        } else {
            setSelectedRooms([...selectedRooms, id])
        }
    }

    const toggleBed = (id: number) => {
        if (selectedBeds.includes(id)) {
            setSelectedBeds(selectedBeds.filter(b => b !== id))
        } else {
            setSelectedBeds([...selectedBeds, id])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedRooms.length === 0 && selectedBeds.length === 0) {
            alert('Please select at least one room or bed')
            return
        }

        setSubmitting(true)
        try {
            const res = await fetch('/api/bookings/group', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guestDetails,
                    roomIds: selectedRooms,
                    dormBedIds: selectedBeds
                })
            })

            if (res.ok) {
                alert('Group booking successful!')
                router.push('/dashboard')
            } else {
                alert('Booking failed')
            }
        } catch (error) {
            console.error('Group booking error', error)
            alert('An error occurred')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-200 rounded-full"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6" /> Group Booking
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Guest Details */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4">Lead Guest Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Group Name / Leader</label>
                                <input
                                    required
                                    type="text"
                                    value={guestDetails.name}
                                    onChange={e => setGuestDetails({ ...guestDetails, name: e.target.value })}
                                    className="mt-1 w-full p-2 border rounded"
                                    placeholder="e.g. Wedding Party / John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mobile</label>
                                <input
                                    type="text"
                                    value={guestDetails.mobile}
                                    onChange={e => setGuestDetails({ ...guestDetails, mobile: e.target.value })}
                                    className="mt-1 w-full p-2 border rounded"
                                    placeholder="Mobile Number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">City</label>
                                <input
                                    type="text"
                                    value={guestDetails.city}
                                    onChange={e => setGuestDetails({ ...guestDetails, city: e.target.value })}
                                    className="mt-1 w-full p-2 border rounded"
                                    placeholder="City"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
                                <select
                                    value={guestDetails.paymentMode}
                                    onChange={e => setGuestDetails({ ...guestDetails, paymentMode: e.target.value })}
                                    className="mt-1 w-full p-2 border rounded"
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="CARD">Card</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Room Selection */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4">Select Rooms ({availableRooms.length} Available)</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {availableRooms.map((room: any) => (
                                <div
                                    key={room.id}
                                    onClick={() => toggleRoom(room.id)}
                                    className={`p-4 border rounded-lg cursor-pointer flex flex-col items-center justify-center transition ${selectedRooms.includes(room.id)
                                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="font-bold text-lg">{room.roomNumber}</span>
                                    <span className="text-xs text-gray-500">{room.hasBalcony ? 'Balcony' : 'Standard'}</span>
                                    {selectedRooms.includes(room.id) && <Check className="w-4 h-4 mt-1" />}
                                </div>
                            ))}
                            {availableRooms.length === 0 && <p className="text-gray-500 col-span-4">No rooms available.</p>}
                        </div>
                    </div>

                    {/* Bed Selection */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4">Select Dorm Beds ({availableBeds.length} Available)</h2>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                            {availableBeds.map((bed: any) => (
                                <div
                                    key={bed.id}
                                    onClick={() => toggleBed(bed.id)}
                                    className={`p-3 border rounded-lg cursor-pointer flex flex-col items-center justify-center transition ${selectedBeds.includes(bed.id)
                                        ? 'bg-green-100 border-green-500 text-green-700'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="font-bold">Bed {bed.bedNumber}</span>
                                    <div className="text-xs flex gap-1 items-center text-gray-600">
                                        <span>Floor {bed.floorNumber}</span>
                                        <span className={`px-1 rounded text-[10px] font-semibold border ${bed.type === 'LOWER' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                            {bed.type}
                                        </span>
                                    </div>
                                    {selectedBeds.includes(bed.id) && <Check className="w-3 h-3 mt-1" />}
                                </div>
                            ))}
                            {availableBeds.length === 0 && <p className="text-gray-500 col-span-6">No beds available.</p>}
                        </div>
                    </div>

                    {/* Summary & Submit */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
                        <div className="max-w-4xl mx-auto flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-600">Selected</p>
                                <p className="font-bold text-lg">
                                    {selectedRooms.length} Rooms, {selectedBeds.length} Beds
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting || (selectedRooms.length === 0 && selectedBeds.length === 0)}
                                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : 'Confirm Booking'}
                            </button>
                        </div>
                    </div>
                    <div className="h-20"></div> {/* Spacer for fixed footer */}
                </form>
            </div>
        </div>
    )
}
