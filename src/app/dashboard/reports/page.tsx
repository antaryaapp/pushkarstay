"use client"

import { useState } from 'react'
import useSWR from 'swr'
import { BarChart, Users, DollarSign, ShoppingBag, FileDown, UserPlus } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ReportsPage() {
    const { data: report, error } = useSWR('/api/reports', fetcher)

    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [exportLoading, setExportLoading] = useState(false)

    if (error) return <div>Failed to load reports</div>
    if (!report) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>

    const downloadCSV = async () => {
        if (!startDate || !endDate) {
            alert("Please select both Start and End dates.")
            return
        }

        const start = new Date(startDate)
        const end = new Date(endDate)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays > 32) {
            alert("Date range cannot exceed 1 month.")
            return
        }

        if (end < start) {
            alert("End date cannot be before Start date.")
            return
        }

        setExportLoading(true)
        try {
            const res = await fetch(`/api/reports/export?from=${startDate}&to=${endDate}`)
            const data = await res.json()

            if (data.error) {
                alert(data.error)
                return
            }

            if (!data.checkouts || data.checkouts.length === 0) {
                alert("No records found for this date range.")
                return
            }

            const headers = ["Guest Name", "Mobile", "Room/Bed", "Check-in", "Check-out", "Total Bill"]
            const rows = data.checkouts.map((guest: any) => [
                guest.name,
                guest.mobile || "-",
                guest.room?.roomNumber || (guest.dormBed ? `Bed ${guest.dormBed.bedNumber}` : "-"),
                new Date(guest.checkInDate).toLocaleDateString(),
                new Date(guest.checkOutDate).toLocaleDateString(),
                guest.totalBill
            ])

            const csvContent = "data:text/csv;charset=utf-8,"
                + headers.join(",") + "\n"
                + rows.map((e: any[]) => e.join(",")).join("\n")

            const encodedUri = encodeURI(csvContent)
            const link = document.createElement("a")
            link.setAttribute("href", encodedUri)
            link.setAttribute("download", `Report_${startDate}_to_${endDate}.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (e) {
            alert("Export failed")
        } finally {
            setExportLoading(false)
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-black text-black flex items-center gap-3">
                    <BarChart className="w-8 h-8 text-black" />
                    Property Overview
                </h1>

                <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500">From:</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="text-sm border rounded p-1"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500">To:</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="text-sm border rounded p-1"
                        />
                    </div>
                    <button
                        onClick={downloadCSV}
                        disabled={exportLoading}
                        className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-md font-bold hover:bg-green-700 transition shadow-sm text-sm disabled:opacity-50"
                    >
                        <FileDown className="w-4 h-4" /> {exportLoading ? '...' : 'Export'}
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { title: "Active Guests", value: report.activeGuestsCount, icon: Users, color: "blue" },
                    { title: "Today's Revenue", value: `₹${report.todayRevenue}`, icon: DollarSign, color: "green", sub: "Food Orders" },
                    { title: "Order Count", value: report.todayOrdersCount, icon: ShoppingBag, color: "purple" },
                    { title: "Check-ins Today", value: report.todayCheckInsCount, icon: UserPlus, color: "orange" }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-yellow-200 hover:shadow-md transition duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-${item.color}-50 text-${item.color}-900 border border-${item.color}-100`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full bg-${item.color}-50 text-${item.color}-900`}>
                                +0%
                            </span>
                        </div>
                        <h3 className="text-gray-700 text-sm font-bold">{item.title}</h3>
                        <p className="text-3xl font-black text-black mt-1">{item.value}</p>
                        {item.sub && <p className="text-xs text-gray-500 font-medium mt-1">{item.sub}</p>}
                    </div>
                ))}
            </div>

            {/* Recent Check-outs Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-yellow-200 overflow-hidden">
                <div className="p-6 border-b border-yellow-100 flex justify-between items-center bg-yellow-50/50">
                    <div>
                        <h3 className="text-lg font-black text-black">Recent Check-outs</h3>
                        <p className="text-sm text-gray-600 font-medium">History of departed guests and final bills.</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-yellow-100 text-xs font-black text-black uppercase tracking-wider">
                            <tr>
                                <th className="p-5">Guest Name</th>
                                <th className="p-5">Check-in</th>
                                <th className="p-5">Check-out</th>
                                <th className="p-5">Total Bill</th>
                                <th className="p-5">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-yellow-100">
                            {report.recentCheckouts && report.recentCheckouts.length > 0 ? (
                                report.recentCheckouts.map((guest: any) => (
                                    <tr key={guest.id} className="hover:bg-yellow-50 transition duration-150 group">
                                        <td className="p-5">
                                            <div className="font-bold text-black group-hover:text-yellow-800 transition-colors">{guest.name}</div>
                                        </td>
                                        <td className="p-5 text-sm text-black font-medium">
                                            {new Date(guest.checkInDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                        </td>
                                        <td className="p-5 text-sm text-black font-medium">
                                            {new Date(guest.checkOutDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                        </td>
                                        <td className="p-5">
                                            <span className="font-bold text-green-900 bg-green-100 px-2 py-1 rounded-md">₹{guest.totalBill}</span>
                                        </td>
                                        <td className="p-5">
                                            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-full uppercase border border-gray-200">
                                                Checked Out
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-500 font-bold">
                                        No recent checkouts found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
