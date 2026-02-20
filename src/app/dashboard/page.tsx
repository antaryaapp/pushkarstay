'use client'

import useSWR from 'swr'
import { Home, Bed, Utensils, Bell } from 'lucide-react'
import { useState } from 'react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function Dashboard() {
    // Poll every 2 seconds for real-time updates
    const { data, error, mutate } = useSWR('/api/dashboard', fetcher, { refreshInterval: 2000 })
    const { data: orders, mutate: mutateOrders } = useSWR('/api/orders?status=PENDING', fetcher, { refreshInterval: 5000 })

    const [selectedItem, setSelectedItem] = useState<any>(null)

    if (error) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center">
                <p className="font-bold text-lg">Failed to load dashboard</p>
                <p className="text-sm mt-1 text-red-400">Please check your connection</p>
            </div>
        </div>
    )

    if (!data) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
                <div className="w-10 h-10 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 font-medium">Loading dashboard...</p>
            </div>
        </div>
    )

    const { rooms, dormBeds } = data

    const floor2Beds = dormBeds.filter((b: any) => b.floorNumber === 2)
    const floor3Beds = dormBeds.filter((b: any) => b.floorNumber === 3)

    const totalRooms = rooms.length
    const occupiedRooms = rooms.filter((r: any) => r.status === 'OCCUPIED').length
    const totalBeds = dormBeds.length
    const occupiedBeds = dormBeds.filter((b: any) => b.status === 'OCCUPIED').length
    const pendingOrders = orders?.length || 0

    return (
        <div className="space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Rooms</p>
                    <p className="text-2xl font-black text-gray-800 mt-1">
                        {occupiedRooms}<span className="text-gray-300 text-lg">/{totalRooms}</span>
                    </p>
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-500"
                            style={{ width: `${totalRooms ? (occupiedRooms / totalRooms * 100) : 0}%` }}
                        />
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Dorm Beds</p>
                    <p className="text-2xl font-black text-gray-800 mt-1">
                        {occupiedBeds}<span className="text-gray-300 text-lg">/{totalBeds}</span>
                    </p>
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full transition-all duration-500"
                            style={{ width: `${totalBeds ? (occupiedBeds / totalBeds * 100) : 0}%` }}
                        />
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Guests</p>
                    <p className="text-2xl font-black text-gray-800 mt-1">{occupiedRooms + occupiedBeds}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm relative">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Pending Orders</p>
                    <p className="text-2xl font-black text-gray-800 mt-1">{pendingOrders}</p>
                    {pendingOrders > 0 && (
                        <span className="absolute top-3 right-3 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content: Rooms & Beds */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Private Rooms */}
                    <section className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                            <div className="p-2 bg-amber-50 rounded-xl">
                                <Home className="w-5 h-5 text-amber-600" />
                            </div>
                            Private Rooms
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {rooms.map((room: any) => (
                                <RoomCard key={room.id} data={room} onSelect={setSelectedItem} />
                            ))}
                        </div>
                    </section>

                    {/* Dorm Floor 2 */}
                    <section className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                            <div className="p-2 bg-blue-50 rounded-xl">
                                <Bed className="w-5 h-5 text-blue-600" />
                            </div>
                            Dormitory — 2nd Floor
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {floor2Beds.map((bed: any) => (
                                <BedCard key={bed.id} data={bed} onSelect={setSelectedItem} />
                            ))}
                        </div>
                    </section>

                    {/* Dorm Floor 3 */}
                    <section className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                            <div className="p-2 bg-indigo-50 rounded-xl">
                                <Bed className="w-5 h-5 text-indigo-600" />
                            </div>
                            Dormitory — 3rd Floor
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                            {floor3Beds.map((bed: any) => (
                                <BedCard key={bed.id} data={bed} onSelect={setSelectedItem} />
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar: Orders */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-100 sticky top-4">
                        <h2 className="text-base font-bold mb-4 flex items-center gap-2 text-gray-800">
                            <div className="p-1.5 bg-orange-50 rounded-lg">
                                <Utensils className="w-4 h-4 text-orange-600" />
                            </div>
                            Incoming Orders
                            {pendingOrders > 0 && (
                                <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                    {pendingOrders}
                                </span>
                            )}
                        </h2>
                        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                            {orders && orders.length > 0 ? (
                                orders.map((order: any) => (
                                    <div key={order.id} className="border border-gray-100 p-3 rounded-xl bg-gray-50/50 hover:bg-amber-50/50 transition-colors">
                                        <div className="text-sm font-bold flex justify-between text-gray-800">
                                            <span>{order.guest.name}</span>
                                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                                                {order.guest.room ? order.guest.room.roomNumber : `Bed ${order.guest.dormBed?.bedNumber}`}
                                            </span>
                                        </div>
                                        <div className="text-sm mt-2 text-gray-600">
                                            {(() => {
                                                try {
                                                    const items = JSON.parse(order.items)
                                                    if (Array.isArray(items)) {
                                                        return (
                                                            <ul className="space-y-0.5">
                                                                {items.map((item: any, idx: number) => (
                                                                    <li key={idx} className="flex justify-between text-xs">
                                                                        <span>{item.name || item} {item.qty ? `×${item.qty}` : ''}</span>
                                                                        {item.price && <span className="text-gray-400">₹{item.price * (item.qty || 1)}</span>}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )
                                                    }
                                                    return <span className="text-xs">{order.items}</span>
                                                } catch (e) {
                                                    return <span className="text-xs">{order.items}</span>
                                                }
                                            })()}
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs font-bold text-gray-800">₹{order.totalAmount}</span>
                                            <button
                                                onClick={async () => {
                                                    await fetch('/api/orders', {
                                                        method: 'PUT',
                                                        body: JSON.stringify({ id: order.id, status: 'COMPLETED' })
                                                    })
                                                    mutateOrders()
                                                }}
                                                className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 font-semibold transition-colors active:scale-95"
                                            >
                                                ✓ Done
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400 font-medium">No pending orders</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Check-in/out Modal */}
            {selectedItem && (
                <CheckInModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onUpdate={() => mutate()}
                />
            )}
        </div>
    )
}

import { RoomCard } from '@/components/features/RoomCard'
import { BedCard } from '@/components/features/BedCard'
import { CheckInModal } from '@/components/features/CheckInModal'
