"use client"

import { useState } from 'react'
import useSWR from 'swr'
import { Receipt, Search, FileDown, Clock, CheckCircle, CreditCard, Trash2 } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function FoodBillsPage() {
    const { data: orders, error, mutate } = useSWR('/api/orders', fetcher)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')

    if (error) return <div className="p-8 text-center text-red-500 font-medium">Failed to load orders</div>
    if (!orders) return (
        <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
        </div>
    )

    const filteredOrders = orders.filter((order: any) => {
        const matchesSearch = order.guest?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.guest?.room?.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const getTotalRevenue = () => filteredOrders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0)
    const pendingCount = orders.filter((o: any) => o.status === 'PENDING').length
    const completedCount = orders.filter((o: any) => o.status === 'COMPLETED').length
    const paidCount = orders.filter((o: any) => o.status === 'PAID').length

    const updateStatus = async (id: string, newStatus: string) => {
        const updatedOrders = orders.map((o: any) => o.id === id ? { ...o, status: newStatus } : o)
        mutate(updatedOrders, false)
        try {
            await fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            })
            mutate()
        } catch (e) {
            alert('Failed to update status')
            mutate()
        }
    }

    const handleDeleteOrder = async (id: string) => {
        if (!confirm('Delete this food order?')) return
        try {
            await fetch(`/api/orders?id=${id}`, { method: 'DELETE' })
            mutate()
        } catch (e) {
            alert('Failed to delete order')
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
                } else { itemsStr = String(items) }
            } catch (e) { itemsStr = String(order.items) }
            return [
                new Date(order.createdAt).toLocaleDateString(),
                order.guest?.name || "Unknown",
                `"${itemsStr}"`,
                order.totalAmount,
                order.status
            ]
        })
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map((e: any[]) => e.join(",")).join("\n")
        const link = document.createElement("a")
        link.setAttribute("href", encodeURI(csvContent))
        link.setAttribute("download", "food_bills.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800">Food Bills</h1>
                    <p className="text-sm text-gray-400 font-medium">{orders.length} total orders</p>
                </div>
                <button
                    onClick={downloadCSV}
                    className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200/50 active:scale-[0.98] text-sm"
                >
                    <FileDown className="w-4 h-4" /> Export CSV
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Revenue</p>
                    <p className="text-2xl font-black text-gray-800 mt-1">₹{getTotalRevenue()}</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 shadow-sm">
                    <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</p>
                    <p className="text-2xl font-black text-amber-700 mt-1">{pendingCount}</p>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 shadow-sm">
                    <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Served</p>
                    <p className="text-2xl font-black text-blue-700 mt-1">{completedCount}</p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 shadow-sm">
                    <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider flex items-center gap-1"><CreditCard className="w-3 h-3" /> Paid</p>
                    <p className="text-2xl font-black text-emerald-700 mt-1">{paidCount}</p>
                </div>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by guest name, room..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-sm font-medium"
                    />
                </div>
                <div className="flex gap-2">
                    {['ALL', 'PENDING', 'COMPLETED', 'PAID'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${statusFilter === s
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-white text-gray-500 border border-gray-200 hover:border-amber-200'
                                }`}
                        >
                            {s === 'ALL' ? 'All' : s === 'COMPLETED' ? 'Served' : s.charAt(0) + s.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Guest / Location</th>
                                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order: any) => {
                                    let items: any[] = []
                                    try {
                                        items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
                                    } catch (e) { items = [] }

                                    const location = order.guest?.room
                                        ? order.guest.room.roomNumber
                                        : order.guest?.dormBed
                                            ? `Bed ${order.guest.dormBed.bedNumber}`
                                            : 'Unknown'

                                    return (
                                        <tr key={order.id} className="hover:bg-amber-50/30 transition-colors">
                                            <td className="px-5 py-3 text-xs text-gray-400">
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="font-semibold text-gray-800 text-sm">{order.guest?.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-400">{location}</div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="text-xs space-y-0.5 max-w-[200px]">
                                                    {Array.isArray(items) ? items.map((item: any, idx: number) => (
                                                        <span key={idx} className="inline-block bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[11px] font-medium mr-1 mb-0.5">
                                                            {item?.qty || 1}× {item?.name || item}
                                                        </span>
                                                    )) : <span className="text-red-400">-</span>}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 font-bold text-gray-800 text-sm">₹{order.totalAmount}</td>
                                            <td className="px-5 py-3">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateStatus(order.id, e.target.value)}
                                                    className={`px-2 py-1 rounded-lg text-xs font-semibold outline-none cursor-pointer border ${order.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        order.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            'bg-amber-50 text-amber-700 border-amber-200'
                                                        }`}
                                                >
                                                    <option value="PENDING">Pending</option>
                                                    <option value="COMPLETED">Served</option>
                                                    <option value="PAID">Paid</option>
                                                </select>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <button
                                                    onClick={() => handleDeleteOrder(order.id)}
                                                    className="text-red-500 hover:text-red-700 p-1.5 rounded-lg bg-red-50 border border-red-100 transition-colors"
                                                    title="Delete Order"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">No orders found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
