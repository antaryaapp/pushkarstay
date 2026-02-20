"use client"

import { useState } from 'react'
import useSWR from 'swr'
import { BarChart3, Users, IndianRupee, ShoppingBag, FileDown, UserPlus } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ReportsPage() {
    const { data: report, error } = useSWR('/api/reports', fetcher)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [exportLoading, setExportLoading] = useState(false)

    if (error) return <div className="p-8 text-center text-red-500">Failed to load reports</div>
    if (!report) return (
        <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
        </div>
    )

    const downloadCSV = async () => {
        if (!startDate || !endDate) { alert("Please select both Start and End dates."); return }
        const start = new Date(startDate)
        const end = new Date(endDate)
        if (end < start) { alert("End date cannot be before Start date."); return }
        const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays > 32) { alert("Date range cannot exceed 1 month."); return }

        setExportLoading(true)
        try {
            const res = await fetch(`/api/reports/export?from=${startDate}&to=${endDate}`)
            const data = await res.json()
            if (data.error) { alert(data.error); return }
            if (!data.checkouts || data.checkouts.length === 0) { alert("No records found."); return }

            const headers = ["Guest Name", "Mobile", "Room/Bed", "Check-in", "Check-out", "Total Bill"]
            const rows = data.checkouts.map((guest: any) => [
                guest.name, guest.mobile || "-",
                guest.room?.roomNumber || (guest.dormBed ? `Bed ${guest.dormBed.bedNumber}` : "-"),
                new Date(guest.checkInDate).toLocaleDateString(),
                new Date(guest.checkOutDate).toLocaleDateString(),
                guest.totalBill
            ])
            const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map((e: any[]) => e.join(",")).join("\n")
            const link = document.createElement("a")
            link.setAttribute("href", encodeURI(csvContent))
            link.setAttribute("download", `Report_${startDate}_to_${endDate}.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (e) { alert("Export failed") }
        finally { setExportLoading(false) }
    }

    const stats = [
        { title: "Active Guests", value: report.activeGuestsCount, icon: Users, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
        { title: "Today's Revenue", value: `₹${report.todayRevenue}`, icon: IndianRupee, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', sub: "Food Orders" },
        { title: "Order Count", value: report.todayOrdersCount, icon: ShoppingBag, bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
        { title: "Check-ins Today", value: report.todayCheckInsCount, icon: UserPlus, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' }
    ]

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-amber-500" /> Reports
                    </h1>
                    <p className="text-sm text-gray-400 font-medium">Property overview & export data</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-gray-400">From</span>
                        <input
                            type="date" value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="text-sm border border-gray-200 rounded-lg p-1.5 focus:ring-2 focus:ring-amber-400 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-gray-400">To</span>
                        <input
                            type="date" value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="text-sm border border-gray-200 rounded-lg p-1.5 focus:ring-2 focus:ring-amber-400 outline-none"
                        />
                    </div>
                    <button
                        onClick={downloadCSV}
                        disabled={exportLoading}
                        className="flex items-center gap-1.5 bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-emerald-600 transition text-sm disabled:opacity-50"
                    >
                        <FileDown className="w-4 h-4" /> {exportLoading ? '...' : 'Export'}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((item, idx) => (
                    <div key={idx} className={`${item.bg} p-5 rounded-2xl border ${item.border} shadow-sm`}>
                        <div className={`p-2 rounded-xl ${item.bg} ${item.text} w-fit mb-3`}>
                            <item.icon className="w-5 h-5" />
                        </div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{item.title}</p>
                        <p className={`text-2xl font-black ${item.text} mt-1`}>{item.value}</p>
                        {item.sub && <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>}
                    </div>
                ))}
            </div>

            {/* Recent Checkouts */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Recent Check-outs</h3>
                    <p className="text-xs text-gray-400 mt-0.5">History of departed guests and bills</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Guest</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-in</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-out</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bill</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {report.recentCheckouts && report.recentCheckouts.length > 0 ? (
                                report.recentCheckouts.map((guest: any) => (
                                    <tr key={guest.id} className="hover:bg-amber-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm">
                                                    {guest.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-gray-800 text-sm">{guest.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(guest.checkInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(guest.checkOutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg text-sm">₹{guest.totalBill}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                Checked Out
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">No recent checkouts</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
