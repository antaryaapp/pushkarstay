'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit2, Save, X, Loader2, Search } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function GuestPage() {
    const router = useRouter()
    const { data: guests, error, mutate } = useSWR('/api/guests?status=CHECKED_IN', fetcher)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState({ name: '', mobile: '', city: '', paymentMode: '' })

    const startEdit = (guest: any) => {
        setEditingId(guest.id)
        setEditForm({
            name: guest.name,
            mobile: guest.mobile,
            city: guest.city,
            paymentMode: guest.paymentMode
        })
    }

    const cancelEdit = () => {
        setEditingId(null)
    }

    const saveEdit = async (id: string) => {
        try {
            await fetch(`/api/guests/${id}`, {
                method: 'PUT',
                body: JSON.stringify(editForm)
            })
            setEditingId(null)
            mutate()
        } catch (error) {
            console.error('Failed to update guest', error)
        }
    }

    if (error) return <div>Failed to load guests</div>
    if (!guests) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className="min-h-screen bg-gray-50 p-4 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-700" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Guest Management</h1>
                            <p className="text-sm text-gray-500">Manage active guests and their details</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Guest Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-in Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Accommodation</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mobile</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">City</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {guests.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            No active guests found.
                                        </td>
                                    </tr>
                                ) : (
                                    guests.map((guest: any) => (
                                        <tr key={guest.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {editingId === guest.id ? (
                                                    <input
                                                        className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-1 w-full border"
                                                        value={editForm.name}
                                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                    />
                                                ) : guest.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(guest.checkInDate).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {guest.room ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        Room {guest.room.roomNumber}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        Bed {guest.dormBed?.bedNumber} (Flr {guest.dormBed?.floorNumber})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {editingId === guest.id ? (
                                                    <input
                                                        className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-1 w-full border"
                                                        value={editForm.mobile}
                                                        onChange={e => setEditForm({ ...editForm, mobile: e.target.value })}
                                                    />
                                                ) : guest.mobile || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {editingId === guest.id ? (
                                                    <input
                                                        className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-1 w-full border"
                                                        value={editForm.city}
                                                        onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                                                    />
                                                ) : guest.city || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {editingId === guest.id ? (
                                                    <select
                                                        className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-1 w-full border"
                                                        value={editForm.paymentMode}
                                                        onChange={e => setEditForm({ ...editForm, paymentMode: e.target.value })}
                                                    >
                                                        <option value="CASH">CASH</option>
                                                        <option value="UPI">UPI</option>
                                                        <option value="CARD">CARD</option>
                                                    </select>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        {guest.paymentMode}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {editingId === guest.id ? (
                                                    <div className="flex gap-2 justify-end">
                                                        <button onClick={() => saveEdit(guest.id)} className="text-green-600 hover:text-green-900 bg-green-50 p-1 rounded">
                                                            <Save className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={cancelEdit} className="text-gray-600 hover:text-gray-900 bg-gray-50 p-1 rounded">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => startEdit(guest)} className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-full hover:bg-blue-100 transition-colors">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
