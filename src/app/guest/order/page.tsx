"use client"

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Trash2 } from 'lucide-react'
import { MENU_ITEMS } from '@/lib/menu' // We need to expose this to frontend or duplicate it. 
// Ideally via API, but for MVP importing from lib is fine if it's shared code. 
// Next.js allows importing lib files in client components if they don't use server-only modules.
// Let's assume MENU_ITEMS is safe.

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function GuestOrderPage() {
    const { data: dashboard } = useSWR('/api/dashboard', fetcher)

    const [selectedGuestId, setSelectedGuestId] = useState('')
    const [cart, setCart] = useState<{ id: string, name: string, price: number, qty: number }[]>([])
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    // Filter only occupied rooms/beds
    const occupiedLocations: { id: string; name: string }[] = []
    if (dashboard) {
        dashboard.rooms.forEach((r: any) => {
            if (r.status === 'OCCUPIED' && r.guests.length > 0) {
                occupiedLocations.push({
                    id: r.guests[0].id,
                    name: `${r.roomNumber} - ${r.guests[0].name}`
                })
            }
        })
        dashboard.dormBeds.forEach((b: any) => {
            if (b.status === 'OCCUPIED' && b.guests.length > 0) {
                occupiedLocations.push({
                    id: b.guests[0].id,
                    name: `Bed ${b.bedNumber} (Floor ${b.floorNumber}) - ${b.guests[0].name}`
                })
            }
        })
    }

    const { data: menuItems } = useSWR('/api/menu', fetcher)

    const addToCart = (item: any) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id)
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
            }
            return [...prev, { ...item, qty: 1 }]
        })
        setSuccess(false)
    }

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(i => i.id !== id))
    }

    const updateQty = (id: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.id === id) {
                return { ...i, qty: Math.max(1, i.qty + delta) }
            }
            return i
        }))
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0)

    const handleOrder = async () => {
        if (!selectedGuestId) {
            alert('Please select your Room or Bed first.')
            return
        }
        if (cart.length === 0) return

        setLoading(true)
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guestId: selectedGuestId,
                    items: cart // Sending full object {id, name, price, qty}
                })
            })

            if (!res.ok) {
                throw new Error('Failed to place order')
            }

            setSuccess(true)
            setCart([])
            setTimeout(() => setSuccess(false), 3000)
        } catch (error) {
            console.error(error)
            alert('Order failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-yellow-50 p-4 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg border border-yellow-200 overflow-hidden flex flex-col md:flex-row h-[800px]">
                    {/* Left Side: Order Form */}
                    <div className="md:w-1/3 bg-yellow-100 p-6 text-black flex flex-col gap-6 overflow-y-auto border-r border-yellow-200">
                        <div>
                            <h1 className="text-2xl font-black mb-1">Order Food</h1>
                            <p className="text-gray-600 text-sm mb-6 font-medium">Select room/bed & items.</p>

                            <div className="mb-4">
                                <label className="block text-xs font-bold text-black mb-1 uppercase tracking-wider">Your Location</label>
                                <select
                                    value={selectedGuestId}
                                    onChange={(e) => setSelectedGuestId(e.target.value)}
                                    className="w-full p-2 text-sm border border-yellow-300 rounded-md bg-white text-black focus:ring-2 focus:ring-yellow-400 font-bold"
                                >
                                    <option value="" className="text-gray-500">Select Room / Bed</option>
                                    {occupiedLocations.map((loc: any) => (
                                        <option key={loc.id} value={loc.id} className="text-black font-bold">{loc.name}</option>
                                    ))}
                                </select>
                            </div>

                            {success && (
                                <div className="bg-green-500 text-white p-3 rounded-md text-center text-sm font-bold shadow-md animate-bounce mb-4">
                                    Order Placed!
                                </div>
                            )}
                        </div>

                        {/* Cart Summary (Compact) */}
                        {cart.length > 0 ? (
                            <div className="bg-white border-2 border-yellow-400 rounded-lg p-3 flex-1 flex flex-col">
                                <h3 className="font-bold text-sm mb-2 border-b border-gray-200 pb-1 flex justify-between items-center text-black">
                                    <span>Your Cart</span>
                                    <span className="bg-yellow-200 text-black px-2 py-0.5 rounded text-xs font-bold">{cart.length} items</span>
                                </h3>
                                <div className="space-y-2 mb-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center text-sm bg-yellow-50 p-2 rounded border border-yellow-100">
                                            <div className="flex-1">
                                                <div className="font-bold text-black">{item.name}</div>
                                                <div className="text-xs text-gray-600 font-bold">₹{item.price} x {item.qty}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center bg-gray-100 rounded border border-gray-300">
                                                    <button onClick={() => updateQty(item.id, -1)} className="px-2 py-1 text-xs hover:bg-gray-200 disabled:opacity-50 font-bold text-black" disabled={item.qty <= 1}>-</button>
                                                    <span className="text-xs w-4 text-center font-bold text-black">{item.qty}</span>
                                                    <button onClick={() => updateQty(item.id, 1)} className="px-2 py-1 text-xs hover:bg-gray-200 font-bold text-black">+</button>
                                                </div>
                                                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-1 rounded transition ml-1">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-auto">
                                    <div className="flex justify-between font-black text-base pt-2 border-t border-gray-200 mb-3 text-black">
                                        <span>Total</span>
                                        <span>₹{total}</span>
                                    </div>
                                    <button
                                        onClick={handleOrder}
                                        disabled={loading}
                                        className="w-full bg-black text-white py-3 rounded-md font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-sm text-sm"
                                    >
                                        {loading ? 'Placing...' : `Confirm Order`}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm font-medium border-2 border-dashed border-gray-300 rounded-lg">
                                Cart is empty
                            </div>
                        )}
                    </div>

                    {/* Right Side: Menu */}
                    <div className="md:w-2/3 p-8 bg-yellow-50 h-[800px] overflow-y-auto">
                        <h3 className="text-xl font-black text-black mb-6 sticky top-0 bg-yellow-50 py-2 z-10 border-b border-yellow-200">Menu</h3>
                        {!menuItems ? (
                            <div className="text-center py-10 text-gray-500 font-bold">Loading menu...</div>
                        ) : (
                            <div className="space-y-8">
                                {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'].map(category => {
                                    const categoryItems = menuItems.filter((i: any) => i.category === category && i.isAvailable)
                                    if (categoryItems.length === 0) return null

                                    return (
                                        <div key={category}>
                                            <h4 className="font-bold text-lg text-black mb-4 border-l-4 border-black pl-3">{category}</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {categoryItems.map((item: any) => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => addToCart(item)}
                                                        className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-yellow-400 text-left transition-all duration-200 group relative overflow-hidden"
                                                    >
                                                        <div className="relative z-10 w-full">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <h4 className="font-bold text-black group-hover:text-yellow-700 transition-colors">{item.name}</h4>
                                                                <span className="bg-yellow-100 text-black text-xs font-bold px-2 py-1 rounded-full">₹{item.price}</span>
                                                            </div>
                                                            <p className="text-xs text-gray-600 font-medium">{item.category}</p>
                                                        </div>
                                                        <div className="absolute inset-0 bg-yellow-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 text-black">
                                                            <Plus className="w-5 h-5" />
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}

                                {menuItems.filter((i: any) => i.isAvailable).length === 0 && (
                                    <p className="text-gray-500 text-center py-10 font-bold">No items available right now.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
