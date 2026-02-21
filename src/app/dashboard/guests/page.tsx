'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Edit2, Save, X, Loader2, Search, Users, CalendarClock, Phone, MapPin, CreditCard, UserCheck, History, Trash2 } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

type GuestTab = 'active' | 'today_checkout' | 'all'

export default function GuestPage() {
    const [tab, setTab] = useState<GuestTab>('active')
    const [search, setSearch] = useState('')

    const { data: activeGuests, mutate: mutateActive } = useSWR('/api/guests?status=CHECKED_IN', fetcher)
    const { data: allGuests, mutate: mutateAll } = useSWR('/api/guests', fetcher)

    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState({ name: '', mobile: '', city: '', paymentMode: '' })

    const startEdit = (guest: any) => {
        setEditingId(guest.id)
        setEditForm({
            name: guest.name,
            mobile: guest.mobile || '',
            city: guest.city || '',
            paymentMode: guest.paymentMode || 'CASH'
        })
    }

    const cancelEdit = () => setEditingId(null)

    const saveEdit = async (id: string) => {
        try {
            await fetch(`/api/guests/${id}`, {
                method: 'PUT',
                body: JSON.stringify(editForm)
            })
            setEditingId(null)
            mutateActive()
            mutateAll()
        } catch (error) {
            console.error('Failed to update guest', error)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will PERMANENTLY delete the guest and all their food orders. This action cannot be undone.')) return
        try {
            const res = await fetch(`/api/guests/${id}`, { method: 'DELETE' })
            if (res.ok) {
                mutateActive()
                mutateAll()
            } else {
                alert('Failed to delete guest')
            }
        } catch (error) {
            console.error('Delete failed', error)
        }
    }

    // Calculate today's expected checkouts (guests who've been here 1+ nights)
    const todayStr = new Date().toISOString().split('T')[0]
    const todayCheckouts = activeGuests?.filter((g: any) => {
        const checkIn = new Date(g.checkInDate)
        const now = new Date()
        const nights = Math.ceil((now.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        return nights >= 1
    }) || []

    // Get the guest list based on active tab
    const getGuestList = () => {
        let guests: any[] = []
        if (tab === 'active') guests = activeGuests || []
        else if (tab === 'today_checkout') guests = todayCheckouts
        else guests = allGuests || []

        if (search.trim()) {
            const q = search.toLowerCase()
            guests = guests.filter((g: any) =>
                g.name?.toLowerCase().includes(q) ||
                g.mobile?.toLowerCase().includes(q) ||
                g.city?.toLowerCase().includes(q)
            )
        }
        return guests
    }

    const guests = getGuestList()
    const isLoading = !activeGuests

    const getAccommodation = (guest: any) => {
        if (guest.room) return { label: guest.room.roomNumber, type: 'room' }
        if (guest.dormBed) return { label: `Bed ${guest.dormBed.bedNumber} (Flr ${guest.dormBed.floorNumber})`, type: 'dorm' }
        return { label: '-', type: 'none' }
    }

    const getNights = (checkInDate: string) => {
        const checkIn = new Date(checkInDate)
        const now = new Date()
        return Math.max(1, Math.ceil((now.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-800">Guest Management</h1>
                    <p className="text-sm text-gray-400 font-medium">Manage guests, track stays & checkouts</p>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search name, mobile, city..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none font-medium"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                <button
                    onClick={() => setTab('active')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${tab === 'active'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200/50'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-200'
                        }`}
                >
                    <UserCheck className="w-4 h-4" />
                    Active Guests
                    {activeGuests && <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{activeGuests.length}</span>}
                </button>
                <button
                    onClick={() => setTab('today_checkout')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${tab === 'today_checkout'
                        ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-200/50'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-red-200'
                        }`}
                >
                    <CalendarClock className="w-4 h-4" />
                    Daily Checkout
                    <span className={`px-2 py-0.5 rounded-full text-xs ${tab === 'today_checkout' ? 'bg-white/20' : 'bg-red-50 text-red-600'}`}>
                        {todayCheckouts.length}
                    </span>
                </button>
                <button
                    onClick={() => setTab('all')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${tab === 'all'
                        ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-purple-200/50'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-200'
                        }`}
                >
                    <History className="w-4 h-4" />
                    All History
                    {allGuests && <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{allGuests.length}</span>}
                </button>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
                </div>
            )}

            {/* Guest Cards (Mobile) + Table (Desktop) */}
            {!isLoading && (
                <>
                    {guests.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-400 font-medium">No guests found</p>
                            <p className="text-gray-300 text-sm mt-1">{search ? 'Try a different search' : tab === 'today_checkout' ? 'No guests due for checkout today' : 'No guests to show'}</p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-3">
                                {guests.map((guest: any) => {
                                    const accom = getAccommodation(guest)
                                    const nights = getNights(guest.checkInDate)
                                    return (
                                        <div key={guest.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="font-bold text-gray-800">{guest.name}</h3>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${accom.type === 'room' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                                                        {accom.label}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${guest.status === 'CHECKED_IN' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                        {guest.status === 'CHECKED_IN' ? 'Active' : 'Checked Out'}
                                                    </span>
                                                    <p className="text-xs text-gray-400 mt-1">{nights} night{nights > 1 ? 's' : ''}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="flex items-center gap-1.5 text-gray-500">
                                                    <Phone className="w-3 h-3" />
                                                    {guest.mobile || '-'}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-gray-500">
                                                    <MapPin className="w-3 h-3" />
                                                    {guest.city || '-'}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-gray-500">
                                                    <CreditCard className="w-3 h-3" />
                                                    {guest.paymentMode || 'CASH'}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-gray-500">
                                                    <CalendarClock className="w-3 h-3" />
                                                    {new Date(guest.checkInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Desktop Table */}
                            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-100">
                                        <thead className="bg-gray-50/50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Guest</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-in</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nights</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mobile</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">City</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {guests.map((guest: any) => {
                                                const accom = getAccommodation(guest)
                                                const nights = getNights(guest.checkInDate)
                                                return (
                                                    <tr key={guest.id} className="hover:bg-amber-50/30 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {editingId === guest.id ? (
                                                                <input
                                                                    className="border border-gray-200 rounded-lg px-3 py-1.5 w-full text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                                                                    value={editForm.name}
                                                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                                />
                                                            ) : (
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                                        {guest.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <span className="font-semibold text-gray-800 text-sm">{guest.name}</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${accom.type === 'room' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                                                                {accom.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(guest.checkInDate).toLocaleDateString('en-IN', {
                                                                day: 'numeric', month: 'short',
                                                                hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${nights >= 3 ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                {nights} night{nights > 1 ? 's' : ''}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {editingId === guest.id ? (
                                                                <input
                                                                    className="border border-gray-200 rounded-lg px-3 py-1.5 w-28 text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                                                                    value={editForm.mobile}
                                                                    onChange={e => setEditForm({ ...editForm, mobile: e.target.value })}
                                                                />
                                                            ) : (guest.mobile || '-')}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {editingId === guest.id ? (
                                                                <input
                                                                    className="border border-gray-200 rounded-lg px-3 py-1.5 w-24 text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                                                                    value={editForm.city}
                                                                    onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                                                                />
                                                            ) : (guest.city || '-')}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {editingId === guest.id ? (
                                                                <select
                                                                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-amber-400 outline-none"
                                                                    value={editForm.paymentMode}
                                                                    onChange={e => setEditForm({ ...editForm, paymentMode: e.target.value })}
                                                                >
                                                                    <option value="CASH">Cash</option>
                                                                    <option value="UPI">UPI</option>
                                                                    <option value="CARD">Card</option>
                                                                </select>
                                                            ) : (
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${guest.paymentMode === 'UPI' ? 'bg-green-50 text-green-700' : guest.paymentMode === 'CARD' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                    {guest.paymentMode || 'CASH'}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${guest.status === 'CHECKED_IN' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                                {guest.status === 'CHECKED_IN' ? 'Active' : 'Checked Out'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                            <div className="flex gap-2 justify-end">
                                                                {tab === 'active' && (
                                                                    <>
                                                                        {editingId === guest.id ? (
                                                                            <>
                                                                                <button onClick={() => saveEdit(guest.id)} className="text-emerald-600 bg-emerald-50 p-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors">
                                                                                    <Save className="w-4 h-4" />
                                                                                </button>
                                                                                <button onClick={cancelEdit} className="text-gray-500 bg-gray-50 p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                                                                    <X className="w-4 h-4" />
                                                                                </button>
                                                                            </>
                                                                        ) : (
                                                                            <button onClick={() => startEdit(guest)} className="text-amber-600 bg-amber-50 p-1.5 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors">
                                                                                <Edit2 className="w-4 h-4" />
                                                                            </button>
                                                                        )}
                                                                    </>
                                                                )}
                                                                <button onClick={() => handleDelete(guest.id)} className="text-red-500 bg-red-50 p-1.5 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    )
}
