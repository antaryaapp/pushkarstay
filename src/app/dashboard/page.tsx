'use client'

import useSWR from 'swr'
import { LogOut, Home, Bed, Utensils } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function Dashboard() {
    const router = useRouter()
    // Poll every 2 seconds for real-time updates
    const { data, error, mutate } = useSWR('/api/dashboard', fetcher, { refreshInterval: 2000 })
    const { data: orders, mutate: mutateOrders } = useSWR('/api/orders?status=PENDING', fetcher, { refreshInterval: 5000 })

    const [selectedItem, setSelectedItem] = useState<any>(null) // For check-in/out modal

    if (error) return <div>Failed to load</div>
    if (!data) return <div className="p-8">Loading dashboard...</div>

    const { rooms, dormBeds } = data

    // Filter dorm beds by floor
    const floor2Beds = dormBeds.filter((b: any) => b.floorNumber === 2)
    const floor3Beds = dormBeds.filter((b: any) => b.floorNumber === 3)

    return (
        <div className="min-h-screen bg-yellow-50">
            {/* Header */}
            < header className="bg-yellow-50 border-b border-yellow-200 p-4 sticky top-0 z-10" >
                <div className="max-w-7xl mx-auto flex flex-wrap gap-4 justify-between items-center">
                    <h1 className="text-xl font-black flex items-center gap-2 text-black">
                        <Home className="w-6 h-6 text-black" />
                        PMS Dashboard
                    </h1>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/dashboard/menu')}
                            className="bg-white border border-blue-200 text-blue-900 px-3 py-1 rounded-md text-sm font-bold hover:bg-blue-50"
                        >
                            Manage Menu
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/guests')}
                            className="bg-white border border-purple-200 text-purple-900 px-3 py-1 rounded-md text-sm font-bold hover:bg-purple-50"
                        >
                            Guests
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/group-booking')}
                            className="bg-white border border-green-200 text-green-900 px-3 py-1 rounded-md text-sm font-bold hover:bg-green-50"
                        >
                            Group Booking
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/food-bills')}
                            className="bg-white border border-yellow-400 text-yellow-900 px-3 py-1 rounded-md text-sm font-bold hover:bg-yellow-100"
                        >
                            Food Bills
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="text-red-700 font-bold hover:text-red-900 flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                </div>
            </header >

            <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content: Rooms & Beds */}
                <div className="lg:col-span-3 space-y-8">

                    {/* Private Rooms */}
                    <section>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-black">
                            <Home className="w-5 h-5 text-black" /> Private Rooms
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {rooms.map((room: any) => (
                                <RoomCard key={room.id} data={room} onSelect={setSelectedItem} />
                            ))}
                        </div>
                    </section>

                    {/* Dorm Floor 2 */}
                    <section>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-black">
                            <Bed className="w-5 h-5 text-black" /> Dormitory (2nd Floor)
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {floor2Beds.map((bed: any) => (
                                <BedCard key={bed.id} data={bed} onSelect={setSelectedItem} />
                            ))}
                        </div>
                    </section>

                    {/* Dorm Floor 3 */}
                    <section>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-black">
                            <Bed className="w-5 h-5 text-black" /> Dormitory (3rd Floor)
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
                    <div className="bg-yellow-100 p-4 rounded-lg shadow border border-yellow-300 sticky top-24">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-black">
                            <Utensils className="w-5 h-5 text-black" /> Incoming Orders
                        </h2>
                        <div className="space-y-3 max-h-[80vh] overflow-y-auto">
                            {orders && orders.length > 0 ? (
                                orders.map((order: any) => (
                                    <div key={order.id} className="border border-yellow-300 p-3 rounded bg-white shadow-sm">
                                        <div className="text-sm font-bold flex justify-between text-black">
                                            <span>{order.guest.name}</span>
                                            <span className="text-xs text-gray-700">
                                                {order.guest.room ? order.guest.room.roomNumber : `Bed ${order.guest.dormBed?.bedNumber}`}
                                            </span>
                                        </div>
                                        <div className="text-sm mt-1 text-black">
                                            {(() => {
                                                try {
                                                    const items = JSON.parse(order.items)
                                                    if (Array.isArray(items)) {
                                                        return (
                                                            <ul className="list-disc list-inside text-black">
                                                                {items.map((item: any, idx: number) => (
                                                                    <li key={idx}>
                                                                        {item.name || item} {item.qty ? `x${item.qty}` : ''}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )
                                                    }
                                                    return <span>{order.items}</span>
                                                } catch (e) {
                                                    return <span>{order.items}</span>
                                                }
                                            })()}
                                        </div>
                                        <button
                                            onClick={async () => {
                                                await fetch('/api/orders', {
                                                    method: 'PUT',
                                                    body: JSON.stringify({ id: order.id, status: 'COMPLETED' })
                                                })
                                                mutateOrders()
                                            }}
                                            className="mt-2 w-full text-xs bg-green-200 text-green-900 py-1 rounded hover:bg-green-300 font-bold"
                                        >
                                            Mark Done
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-600 text-center py-4">No pending orders</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal would go here */}
            {
                selectedItem && (
                    <CheckInModal
                        item={selectedItem}
                        onClose={() => setSelectedItem(null)}
                        onUpdate={() => mutate()}
                    />
                )
            }
        </div >
    )
}

// Sub-components to be moved to separate files ideally, but defined here for MVP speed if cleaner, 
// but I will put them here for now to ensure context is available.
// Actually, I should create separate files as per best practice, but for the Plan step I said "Dashboard UI components".
// I'll define simple versions here or import. 
// I'll import them, so I must create them.
// I will just put placeholders here and define them in separate files in next step.
// Wait, TS will complain if I don't import.
// For now, I will inline them to avoid multiple file creation steps if I can fit them, 
// OR I will perform multiple write_to_file calls.
// I'll assume I'm writing them next.

// Let's create separate files. I will comment them out here or use imports.
// I will use imports.
import { RoomCard } from '@/components/features/RoomCard'
import { BedCard } from '@/components/features/BedCard'
import { CheckInModal } from '@/components/features/CheckInModal'
