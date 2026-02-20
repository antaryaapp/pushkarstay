"use client"

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Trash2, ShoppingCart, ArrowLeft, CheckCircle } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function GuestOrderPage() {
    const { data: dashboard } = useSWR('/api/dashboard', fetcher)
    const { data: menuItems } = useSWR('/api/menu', fetcher)

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
                    items: cart
                })
            })

            if (!res.ok) throw new Error('Failed to place order')

            setSuccess(true)
            setCart([])
            setTimeout(() => setSuccess(false), 4000)
        } catch (error) {
            console.error(error)
            alert('Order failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-amber-100 sticky top-0 z-30 px-4 py-3 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <a href="/" className="p-2 hover:bg-amber-50 rounded-xl transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </a>
                        <div>
                            <h1 className="text-lg font-black bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                                PushkarStay
                            </h1>
                            <p className="text-xs text-gray-400 font-medium">Guest Food Ordering</p>
                        </div>
                    </div>

                    {/* Cart badge (mobile) */}
                    {cart.length > 0 && (
                        <div className="flex items-center gap-2 bg-amber-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md md:hidden">
                            <ShoppingCart className="w-4 h-4" />
                            {cart.length} • ₹{total}
                        </div>
                    )}
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-4">
                {/* Success Banner */}
                {success && (
                    <div className="mb-4 bg-emerald-500 text-white p-4 rounded-2xl text-center font-bold shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 animate-bounce-in">
                        <CheckCircle className="w-5 h-5" />
                        Order placed successfully! Kitchen has been notified.
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-6 md:h-[calc(100vh-120px)]">
                    {/* Left Side: Cart */}
                    <div className="md:w-[340px] flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-5 md:sticky md:top-20 flex flex-col md:max-h-[calc(100vh-140px)]">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Your Order</h2>

                            {/* Guest selector */}
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                                    Select Your Room / Bed
                                </label>
                                <select
                                    value={selectedGuestId}
                                    onChange={(e) => setSelectedGuestId(e.target.value)}
                                    className="w-full p-3 text-sm border border-gray-200 rounded-xl bg-gray-50/50 text-gray-800 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 font-semibold outline-none transition-all"
                                >
                                    <option value="">Choose location...</option>
                                    {occupiedLocations.map((loc: any) => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Cart items */}
                            {cart.length > 0 ? (
                                <>
                                    <div className="space-y-2 flex-1 overflow-y-auto pr-1 mb-4">
                                        {cart.map((item) => (
                                            <div key={item.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                                                    <p className="text-xs text-gray-400 font-medium">₹{item.price} × {item.qty} = ₹{item.price * item.qty}</p>
                                                </div>
                                                <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200">
                                                    <button onClick={() => updateQty(item.id, -1)} className="px-2 py-1 text-sm hover:bg-gray-50 disabled:opacity-30 font-bold text-gray-600 rounded-l-lg transition-colors" disabled={item.qty <= 1}>−</button>
                                                    <span className="text-sm w-6 text-center font-bold text-gray-800">{item.qty}</span>
                                                    <button onClick={() => updateQty(item.id, 1)} className="px-2 py-1 text-sm hover:bg-gray-50 font-bold text-gray-600 rounded-r-lg transition-colors">+</button>
                                                </div>
                                                <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-1 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-gray-100 pt-3">
                                        <div className="flex justify-between font-black text-lg text-gray-800 mb-3">
                                            <span>Total</span>
                                            <span>₹{total}</span>
                                        </div>
                                        <button
                                            onClick={handleOrder}
                                            disabled={loading || !selectedGuestId}
                                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 transition-all shadow-lg shadow-amber-200/50 active:scale-[0.98] text-sm"
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Placing Order...
                                                </span>
                                            ) : (
                                                `Place Order — ₹${total}`
                                            )}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                                    <ShoppingCart className="w-12 h-12 text-gray-200 mb-3" />
                                    <p className="text-gray-400 font-medium text-sm">Your cart is empty</p>
                                    <p className="text-gray-300 text-xs mt-1">Browse the menu to add items</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Menu */}
                    <div className="flex-1 md:overflow-y-auto pb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-5 sticky top-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-2 z-10">
                            Menu
                        </h2>
                        {!menuItems ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'].map(category => {
                                    const categoryItems = menuItems.filter((i: any) => i.category === category && i.isAvailable)
                                    if (categoryItems.length === 0) return null

                                    return (
                                        <div key={category}>
                                            <h3 className="font-bold text-base text-gray-700 mb-3 flex items-center gap-2">
                                                <span className="w-1 h-5 bg-gradient-to-b from-amber-400 to-orange-400 rounded-full" />
                                                {category}
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {categoryItems.map((item: any) => {
                                                    const inCart = cart.find(c => c.id === item.id)
                                                    return (
                                                        <button
                                                            key={item.id}
                                                            onClick={() => addToCart(item)}
                                                            className={`
                                                                p-4 rounded-2xl text-left transition-all duration-200 group relative overflow-hidden active:scale-[0.97]
                                                                ${inCart
                                                                    ? 'bg-amber-50 border-2 border-amber-300 shadow-sm'
                                                                    : 'bg-white border border-gray-100 hover:border-amber-200 hover:shadow-md'
                                                                }
                                                            `}
                                                        >
                                                            <div className="relative z-10">
                                                                <div className="flex justify-between items-start">
                                                                    <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                                                                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                                                                        ₹{item.price}
                                                                    </span>
                                                                </div>
                                                                {inCart && (
                                                                    <span className="text-xs text-amber-600 font-semibold mt-1 inline-block">
                                                                        ×{inCart.qty} in cart
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                                <div className="w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center shadow-sm">
                                                                    <Plus className="w-4 h-4 text-white" />
                                                                </div>
                                                            </div>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}

                                {menuItems.filter((i: any) => i.isAvailable).length === 0 && (
                                    <div className="text-center py-20">
                                        <p className="text-gray-400 font-medium">No items available right now</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
