'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Plus, Loader2 } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function MenuPage() {
    const router = useRouter()
    const { data: items, error, mutate } = useSWR('/api/menu', fetcher)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editForm, setEditForm] = useState({ price: '' })

    // Form State
    const [newItem, setNewItem] = useState({
        name: '',
        category: 'Snacks',
        price: ''
    })

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await fetch('/api/menu', {
                method: 'POST',
                body: JSON.stringify(newItem)
            })
            setNewItem({ name: '', category: 'Snacks', price: '' })
            mutate() // Refresh list
        } catch (error) {
            console.error('Failed to create item', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const startEdit = (item: any) => {
        setEditingId(item.id)
        setEditForm({ price: item.price.toString() })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditForm({ price: '' })
    }

    const saveEdit = async (id: number) => {
        try {
            await fetch(`/api/menu/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ price: editForm.price })
            })
            setEditingId(null)
            mutate()
        } catch (error) {
            console.error('Failed to update price', error)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this item?')) return
        try {
            await fetch(`/api/menu/${id}`, { method: 'DELETE' })
            mutate()
        } catch (error) {
            console.error('Failed to delete item', error)
        }
    }

    const handleToggleAvailability = async (id: number, currentStatus: boolean) => {
        try {
            await fetch(`/api/menu/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ isAvailable: !currentStatus })
            })
            mutate()
        } catch (error) {
            console.error('Failed to update status', error)
        }
    }

    if (error) return <div>Failed to load menu</div>
    if (!items) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className="min-h-screen bg-yellow-50 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-yellow-200 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-black" />
                    </button>
                    <h1 className="text-2xl font-black text-black">Food Menu Management</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Add New Item Form */}
                    <div className="bg-white p-6 rounded-lg shadow h-fit border border-yellow-200">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-black">
                            <Plus className="w-5 h-5 text-black" /> Add New Item
                        </h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-black">Item Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newItem.name}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 text-black font-medium placeholder:text-gray-500"
                                    placeholder="e.g. Aloo Paratha"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-black">Category</label>
                                <select
                                    value={newItem.category}
                                    onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 text-black font-medium bg-white"
                                >
                                    <option>Breakfast</option>
                                    <option>Lunch</option>
                                    <option>Dinner</option>
                                    <option>Beverages</option>
                                    <option>Snacks</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-black">Price (₹)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={newItem.price}
                                    onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 text-black font-medium placeholder:text-gray-500"
                                    placeholder="0"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 disabled:opacity-50 flex justify-center items-center gap-2 font-bold transition"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Item'}
                            </button>
                        </form>
                    </div>

                    {/* Menu List */}
                    <div className="md:col-span-2 bg-white rounded-lg shadow overflow-hidden overflow-x-auto border border-yellow-200">
                        <table className="min-w-full divide-y divide-yellow-200">
                            <thead className="bg-yellow-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-black text-black uppercase tracking-wider">Item</th>
                                    <th className="px-6 py-3 text-left text-xs font-black text-black uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-black text-black uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-black text-black uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-black text-black uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-yellow-100">
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500 font-bold">No items found. Add one!</td>
                                    </tr>
                                ) : (
                                    items.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-yellow-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black">{item.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-medium">{item.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-bold">
                                                {editingId === item.id ? (
                                                    <input
                                                        type="number"
                                                        value={editForm.price}
                                                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                                        className="w-20 border border-yellow-300 rounded px-1 focus:ring-2 focus:ring-yellow-400 outline-none"
                                                    />
                                                ) : (
                                                    `₹${item.price}`
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                                                    className={`px-2 inline-flex text-xs leading-5 font-bold rounded-full ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {item.isAvailable ? 'Available' : 'Unavailable'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {editingId === item.id ? (
                                                    <div className="flex gap-2 justify-end">
                                                        <button onClick={() => saveEdit(item.id)} className="text-green-700 hover:text-green-900 font-bold">Save</button>
                                                        <button onClick={cancelEdit} className="text-gray-600 hover:text-gray-900 font-bold">Cancel</button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2 justify-end">
                                                        <button onClick={() => startEdit(item)} className="text-black hover:text-yellow-700 font-bold">Edit</button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
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
