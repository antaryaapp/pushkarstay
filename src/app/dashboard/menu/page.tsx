'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Trash2, Plus, Loader2, ToggleLeft, ToggleRight, Edit3, Save, X } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function MenuPage() {
    const { data: items, error, mutate } = useSWR('/api/menu', fetcher)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editForm, setEditForm] = useState({ price: '' })
    const [activeCategory, setActiveCategory] = useState('All')

    // Form State
    const [newItem, setNewItem] = useState({ name: '', category: 'Snacks', price: '' })

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await fetch('/api/menu', {
                method: 'POST',
                body: JSON.stringify(newItem)
            })
            setNewItem({ name: '', category: 'Snacks', price: '' })
            mutate()
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
        if (!confirm('Delete this item?')) return
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

    if (error) return <div className="p-8 text-center text-red-500 font-medium">Failed to load menu</div>
    if (!items) return (
        <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
        </div>
    )

    const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages']
    const filteredItems = activeCategory === 'All' ? items : items.filter((i: any) => i.category === activeCategory)

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-black text-gray-800">Menu Management</h1>
                <p className="text-sm text-gray-400 font-medium">{items.length} items • {items.filter((i: any) => i.isAvailable).length} available</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Add New Item Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-100 sticky top-4">
                        <h2 className="text-base font-bold mb-4 flex items-center gap-2 text-gray-800">
                            <Plus className="w-4 h-4 text-amber-500" /> Add New Item
                        </h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Item Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newItem.name}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-sm font-medium bg-gray-50/50"
                                    placeholder="e.g. Aloo Paratha"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Category</label>
                                <select
                                    value={newItem.category}
                                    onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-sm font-medium"
                                >
                                    <option>Breakfast</option>
                                    <option>Lunch</option>
                                    <option>Dinner</option>
                                    <option>Beverages</option>
                                    <option>Snacks</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Price (₹)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={newItem.price}
                                    onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-sm font-medium bg-gray-50/50"
                                    placeholder="0"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 transition-all shadow-lg shadow-amber-200/50 active:scale-[0.98] text-sm"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Adding...
                                    </span>
                                ) : 'Add Item'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Menu List */}
                <div className="lg:col-span-2">
                    {/* Category filter tabs */}
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${activeCategory === cat
                                    ? 'bg-amber-500 text-white shadow-sm'
                                    : 'bg-white text-gray-500 border border-gray-200 hover:border-amber-200'
                                    }`}
                            >
                                {cat}
                                {cat !== 'All' && (
                                    <span className="ml-1 opacity-60">
                                        ({items.filter((i: any) => i.category === cat).length})
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">No items in this category</td>
                                        </tr>
                                    ) : (
                                        filteredItems.map((item: any) => (
                                            <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                                                <td className="px-5 py-3 whitespace-nowrap text-sm font-semibold text-gray-800">{item.name}</td>
                                                <td className="px-5 py-3 whitespace-nowrap">
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.category === 'Breakfast' ? 'bg-yellow-50 text-yellow-700'
                                                        : item.category === 'Lunch' ? 'bg-green-50 text-green-700'
                                                            : item.category === 'Dinner' ? 'bg-indigo-50 text-indigo-700'
                                                                : item.category === 'Snacks' ? 'bg-orange-50 text-orange-700'
                                                                    : 'bg-sky-50 text-sky-700'
                                                        }`}>
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 whitespace-nowrap text-sm">
                                                    {editingId === item.id ? (
                                                        <input
                                                            type="number"
                                                            value={editForm.price}
                                                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                                            className="w-20 border border-amber-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-amber-400 outline-none text-sm"
                                                        />
                                                    ) : (
                                                        <span className="font-semibold text-gray-700">₹{item.price}</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3 whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                                                        className={`flex items-center gap-1 text-xs font-semibold transition-colors ${item.isAvailable ? 'text-emerald-600' : 'text-red-500'}`}
                                                    >
                                                        {item.isAvailable ? (
                                                            <><ToggleRight className="w-5 h-5" /> On</>
                                                        ) : (
                                                            <><ToggleLeft className="w-5 h-5" /> Off</>
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-5 py-3 whitespace-nowrap text-right">
                                                    {editingId === item.id ? (
                                                        <div className="flex gap-1.5 justify-end">
                                                            <button onClick={() => saveEdit(item.id)} className="text-emerald-600 bg-emerald-50 p-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors">
                                                                <Save className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button onClick={cancelEdit} className="text-gray-500 bg-gray-50 p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-1.5 justify-end">
                                                            <button onClick={() => startEdit(item)} className="text-amber-600 bg-amber-50 p-1.5 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors">
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button onClick={() => handleDelete(item.id)} className="text-red-500 bg-red-50 p-1.5 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                                                                <Trash2 className="w-3.5 h-3.5" />
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
        </div>
    )
}
