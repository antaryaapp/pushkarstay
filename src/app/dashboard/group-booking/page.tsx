'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { Loader2, Users, Check } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function GroupBookingPage() {
    const router = useRouter()
    const { data, error } = useSWR('/api/dashboard', fetcher)
    const [submitting, setSubmitting] = useState(false)

    const [guestDetails, setGuestDetails] = useState({
        name: '', mobile: '', city: '', paymentMode: 'CASH'
    })

    const [selectedRooms, setSelectedRooms] = useState<number[]>([])
    const [selectedBeds, setSelectedBeds] = useState<number[]>([])

    if (error) return <div className="p-8 text-center text-red-500">Failed to load data</div>
    if (!data) return (
        <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
        </div>
    )

    const { rooms, dormBeds } = data
    const availableRooms = rooms.filter((r: any) => r.status === 'AVAILABLE')
    const availableBeds = dormBeds.filter((b: any) => b.status === 'AVAILABLE')

    const toggleRoom = (id: number) => {
        setSelectedRooms(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])
    }

    const toggleBed = (id: number) => {
        setSelectedBeds(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id])
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

    const totalSelected = selectedRooms.length + selectedBeds.length

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                    <Users className="w-6 h-6 text-amber-500" /> Group Booking
                </h1>
                <p className="text-sm text-gray-400 font-medium">Book multiple rooms/beds under one guest name</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 pb-24">
                {/* Guest Details */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-100">
                    <h2 className="text-base font-bold text-gray-800 mb-4">Lead Guest Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Group / Leader Name</label>
                            <input
                                required type="text"
                                value={guestDetails.name}
                                onChange={e => setGuestDetails({ ...guestDetails, name: e.target.value })}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-sm font-medium bg-gray-50/50"
                                placeholder="e.g. Wedding Party / John"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Mobile</label>
                            <input
                                type="text"
                                value={guestDetails.mobile}
                                onChange={e => setGuestDetails({ ...guestDetails, mobile: e.target.value })}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-sm font-medium bg-gray-50/50"
                                placeholder="9876543210"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">City</label>
                            <input
                                type="text"
                                value={guestDetails.city}
                                onChange={e => setGuestDetails({ ...guestDetails, city: e.target.value })}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-sm font-medium bg-gray-50/50"
                                placeholder="e.g. Mumbai"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Payment Mode</label>
                            <select
                                value={guestDetails.paymentMode}
                                onChange={e => setGuestDetails({ ...guestDetails, paymentMode: e.target.value })}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-amber-400 outline-none text-sm font-medium"
                            >
                                <option value="CASH">Cash</option>
                                <option value="UPI">UPI</option>
                                <option value="CARD">Card</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Room Selection */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-100">
                    <h2 className="text-base font-bold text-gray-800 mb-4">
                        Select Rooms
                        <span className="text-xs text-gray-400 font-medium ml-2">({availableRooms.length} available)</span>
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {availableRooms.map((room: any) => (
                            <div
                                key={room.id}
                                onClick={() => toggleRoom(room.id)}
                                className={`p-4 border-2 rounded-2xl cursor-pointer flex flex-col items-center justify-center transition-all active:scale-[0.97] ${selectedRooms.includes(room.id)
                                    ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-sm'
                                    : 'border-gray-200 hover:border-amber-200 hover:bg-amber-50/30'
                                    }`}
                            >
                                <span className="font-bold text-lg">{room.roomNumber}</span>
                                <span className="text-xs text-gray-400 font-medium">{room.hasBalcony ? '🌿 Balcony' : 'Standard'}</span>
                                <span className="text-xs text-gray-400 mt-0.5">₹{room.price}/night</span>
                                {selectedRooms.includes(room.id) && <Check className="w-4 h-4 mt-1 text-amber-600" />}
                            </div>
                        ))}
                        {availableRooms.length === 0 && <p className="text-gray-400 text-sm col-span-4">No rooms available</p>}
                    </div>
                </div>

                {/* Bed Selection */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-100">
                    <h2 className="text-base font-bold text-gray-800 mb-4">
                        Select Dorm Beds
                        <span className="text-xs text-gray-400 font-medium ml-2">({availableBeds.length} available)</span>
                    </h2>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {availableBeds.map((bed: any) => (
                            <div
                                key={bed.id}
                                onClick={() => toggleBed(bed.id)}
                                className={`p-3 border-2 rounded-xl cursor-pointer flex flex-col items-center justify-center transition-all active:scale-[0.97] text-center ${selectedBeds.includes(bed.id)
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                                    : 'border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/30'
                                    }`}
                            >
                                <span className="font-bold text-sm">Bed {bed.bedNumber}</span>
                                <div className="text-[10px] text-gray-400 flex gap-1 items-center mt-0.5">
                                    <span>F{bed.floorNumber}</span>
                                    <span className={`px-1 rounded font-bold ${bed.type === 'LOWER' ? 'text-indigo-600' : 'text-orange-600'}`}>
                                        {bed.type === 'LOWER' ? '↓' : '↑'}
                                    </span>
                                </div>
                                {selectedBeds.includes(bed.id) && <Check className="w-3 h-3 mt-1 text-emerald-600" />}
                            </div>
                        ))}
                        {availableBeds.length === 0 && <p className="text-gray-400 text-sm col-span-6">No beds available</p>}
                    </div>
                </div>

                {/* Fixed Footer */}
                <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-4 shadow-xl z-40">
                    <div className="max-w-5xl mx-auto flex justify-between items-center">
                        <div>
                            <p className="text-xs text-gray-400 font-medium">Selected</p>
                            <p className="font-bold text-gray-800">
                                {selectedRooms.length} Room{selectedRooms.length !== 1 ? 's' : ''}, {selectedBeds.length} Bed{selectedBeds.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <button
                            type="submit"
                            disabled={submitting || totalSelected === 0}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 transition-all shadow-lg shadow-amber-200/50 active:scale-[0.98] flex items-center gap-2"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : `Book ${totalSelected} Selection${totalSelected !== 1 ? 's' : ''}`}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
