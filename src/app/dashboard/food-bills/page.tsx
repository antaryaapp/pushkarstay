"use client"

import { useState } from 'react'
import useSWR from 'swr'
import { Receipt, Search, FileDown } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function FoodBillsPage() {
    const { data: orders, error, mutate } = useSWR('/api/orders', fetcher)
    const [searchTerm, setSearchTerm] = useState('')

    if (error) return <div>Failed to load orders</div>
    if (!orders) return <div className="p-8">Loading food bills...</div>

    const filteredOrders = orders.filter((order: any) =>
        order.guest?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.guest?.room?.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getTotalRevenue = () => {
        return filteredOrders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0)
    }

    const updateStatus = async (id: string, newStatus: string) => {
        const updatedOrders = orders.map((o: any) => o.id === id ? { ...o, status: newStatus } : o)

        // Optimistic update
        mutate(updatedOrders, false)

        try {
            await fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            })
            mutate() // Trigger revalidation
        } catch (e) {
            alert('Failed to update status')
            mutate() // Revert changes
        }
    }

    const downloadCSV = () => {
        const headers = ["Date", "Guest Name", "Items", "Amount", "Status"]
        const rows = filteredOrders.map((order: any) => {
            let itemsStr = ""
            try {
                const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
                if (Array.isArray(items)) {
                    itemsStr = items.map((i: any) => `${i.name || i} x${i.qty || 1}`).join("; ")
                } else {
                    itemsStr = String(items)
                }
            } catch (e) { itemsStr = String(order.items) }

            return [
                new Date(order.createdAt).toLocaleDateString(),
                order.guest?.name || "Unknown",
                `"${itemsStr}"`, // Quote to handle commas in items
                order.totalAmount,
                order.status
            ]
        })

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map((e: any[]) => e.join(",")).join("\n")

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", "food_bills.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900">
                        <Receipt className="w-8 h-8 text-blue-600" />
                        Food Bills & Reports
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">View and manage all food orders</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border text-right">
                        <p className="text-xs text-gray-500 uppercase font-bold">Total Revenue</p>
                        <p className="text-xl font-bold text-green-600">₹{getTotalRevenue()}</p>
                    </div>
                    <button
                        onClick={downloadCSV}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition shadow-sm h-full"
                    >
                        <FileDown className="w-5 h-5" /> Export Excel
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by Guest Name, Room, or Order ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Guest / Location</th>
                                <th className="p-4">Items</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order: any) => {
                                    let items = []
                                    try {
                                        items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
                                    } catch (e) { items = [] }

                                    const location = order.guest?.room
                                        ? `Room ${order.guest.room.roomNumber}`
                                        : order.guest?.dormBed
                                            ? `Bed ${order.guest.dormBed.bedNumber}`
                                            : 'Unknown'

                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="p-4 text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium">{order.guest?.name || 'Unknown Guest'}</div>
                                                <div className="text-xs text-gray-500">{location}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm space-y-1">
                                                    {Array.isArray(items) ? items.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex gap-2">
                                                            <span className="font-semibold">{item?.qty || 1}x</span>
                                                            <span>{item?.name || item}</span>
                                                        </div>
                                                    )) : <span className="text-red-400">Invalid Data</span>}
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold">₹{order.totalAmount}</td>
                                            <td className="p-4">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateStatus(order.id, e.target.value)}
                                                    className={`px-2 py-1 rounded-full text-xs font-semibold border-none outline-none cursor-pointer ${order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}
                                                >
                                                    <option value="PENDING">PENDING</option>
                                                    <option value="COMPLETED">UNPAID (Served)</option>
                                                    <option value="PAID">PAID</option>
                                                </select>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">No orders found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
