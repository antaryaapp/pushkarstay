"use client"

import { useState } from 'react'
import useSWR from 'swr'
import { Trash2, UserPlus, Key, Save, X, Users, Shield } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function StaffList() {
    const { data: staff, mutate } = useSWR('/api/staff', fetcher)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [newPassword, setNewPassword] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    // Bulk add state
    const [showBulk, setShowBulk] = useState(false)
    const [bulkUsers, setBulkUsers] = useState([
        { username: '', password: '' },
        { username: '', password: '' },
        { username: '', password: '' },
    ])
    const [bulkLoading, setBulkLoading] = useState(false)

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg)
        setTimeout(() => setSuccessMsg(''), 3000)
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            if (!res.ok) {
                const err = await res.json()
                alert(err.error || 'Failed to add staff')
                return
            }
            setUsername('')
            setPassword('')
            mutate()
            showSuccess(`Staff "${username}" added successfully!`)
        } catch (error) {
            alert('Failed to add staff')
        } finally {
            setLoading(false)
        }
    }

    const handleBulkAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        const validUsers = bulkUsers.filter(u => u.username.trim() && u.password.trim())
        if (validUsers.length === 0) {
            alert('Please fill at least one user')
            return
        }
        setBulkLoading(true)
        let added = 0
        for (const user of validUsers) {
            try {
                const res = await fetch('/api/staff', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(user)
                })
                if (res.ok) added++
            } catch { }
        }
        setBulkUsers([
            { username: '', password: '' },
            { username: '', password: '' },
            { username: '', password: '' },
        ])
        setBulkLoading(false)
        setShowBulk(false)
        mutate()
        showSuccess(`${added} staff member${added > 1 ? 's' : ''} added!`)
    }

    const addBulkRow = () => {
        setBulkUsers([...bulkUsers, { username: '', password: '' }])
    }

    const removeBulkRow = (index: number) => {
        if (bulkUsers.length <= 1) return
        setBulkUsers(bulkUsers.filter((_, i) => i !== index))
    }

    const updateBulkRow = (index: number, field: 'username' | 'password', value: string) => {
        const updated = [...bulkUsers]
        updated[index][field] = value
        setBulkUsers(updated)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this staff member?')) return
        try {
            await fetch(`/api/staff?id=${id}`, { method: 'DELETE' })
            mutate()
            showSuccess('Staff member deleted')
        } catch (error) {
            alert('Failed to delete')
        }
    }

    const handleUpdatePassword = async (id: string) => {
        if (!newPassword) return
        try {
            await fetch('/api/staff', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, password: newPassword })
            })
            setEditingId(null)
            setNewPassword('')
            showSuccess('Password updated successfully!')
        } catch (error) {
            alert('Failed to update password')
        }
    }

    if (!staff) return (
        <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Success Banner */}
            {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-semibold">
                    ✅ {successMsg}
                </div>
            )}

            {/* Admin Password & Reset Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 shadow-sm">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-amber-800 mb-2">
                        <Key className="w-5 h-5" /> Admin Security
                    </h3>
                    <p className="text-sm text-amber-700 mb-4 font-medium">
                        To change the <strong>admin</strong> password, find the "admin" user in the table below and click the <Key className="w-3 h-3 inline" /> icon.
                    </p>
                </div>

                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 shadow-sm">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-red-700 mb-2">
                        <Trash2 className="w-5 h-5" /> Danger Zone
                    </h3>
                    <p className="text-sm text-red-600 mb-4 font-medium">
                        This will PERMANENTLY delete all guest data, food orders, and reset all rooms/beds to available. Use with caution!
                    </p>
                    <button
                        onClick={async () => {
                            if (!confirm('Are you ABSOLUTELY sure? All guest records and food bills will be lost forever.')) return
                            setLoading(true)
                            try {
                                const res = await fetch('/api/reset-data', { method: 'POST' })
                                if (res.ok) showSuccess('All application data has been reset!')
                                else alert('Reset failed')
                            } catch (error) {
                                alert('Reset failed')
                            } finally {
                                setLoading(false)
                            }
                        }}
                        disabled={loading}
                        className="bg-red-600 text-white px-6 py-2.5 rounded-xl hover:bg-red-700 font-bold transition-all shadow-lg shadow-red-200/50 active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Resetting...' : 'Reset All Application Data'}
                    </button>
                </div>
            </div>

            {/* Add Staff Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                        <UserPlus className="w-5 h-5 text-amber-500" /> Add Staff
                    </h3>
                    <button
                        onClick={() => setShowBulk(!showBulk)}
                        className="text-xs font-semibold text-amber-600 hover:text-amber-800 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 transition-colors"
                    >
                        {showBulk ? 'Single Add' : 'Bulk Add'}
                    </button>
                </div>

                {showBulk ? (
                    /* Bulk Add Form */
                    <form onSubmit={handleBulkAdd} className="space-y-3">
                        {bulkUsers.map((user, index) => (
                            <div key={index} className="flex gap-3 items-center">
                                <span className="text-xs text-gray-400 font-bold w-6">{index + 1}.</span>
                                <input
                                    value={user.username}
                                    onChange={e => updateBulkRow(index, 'username', e.target.value)}
                                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-sm font-medium bg-gray-50/50"
                                    placeholder="Username"
                                />
                                <input
                                    type="password"
                                    value={user.password}
                                    onChange={e => updateBulkRow(index, 'password', e.target.value)}
                                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-sm font-medium bg-gray-50/50"
                                    placeholder="Password"
                                />
                                <button type="button" onClick={() => removeBulkRow(index)} className="text-red-400 hover:text-red-600 p-1">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <div className="flex gap-3">
                            <button type="button" onClick={addBulkRow} className="text-sm text-amber-600 hover:text-amber-800 font-semibold">
                                + Add Row
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={bulkLoading}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 transition-all shadow-lg shadow-amber-200/50 active:scale-[0.98]"
                        >
                            {bulkLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Adding...
                                </span>
                            ) : (
                                `Add ${bulkUsers.filter(u => u.username.trim() && u.password.trim()).length} Staff Members`
                            )}
                        </button>
                    </form>
                ) : (
                    /* Single Add Form */
                    <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Username</label>
                            <input
                                value={username} onChange={e => setUsername(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none font-medium bg-gray-50/50"
                                required placeholder="e.g. receptionist1"
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Password</label>
                            <input
                                type="password"
                                value={password} onChange={e => setPassword(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none font-medium bg-gray-50/50"
                                required placeholder="••••••••"
                            />
                        </div>
                        <button disabled={loading} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-xl hover:from-amber-600 hover:to-orange-600 w-full sm:w-auto font-bold transition-all shadow-lg shadow-amber-200/50 active:scale-[0.98] whitespace-nowrap">
                            {loading ? 'Adding...' : 'Add Staff'}
                        </button>
                    </form>
                )}
            </div>

            {/* Staff Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-500" />
                        All Staff ({staff.length})
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {staff.map((s: any) => (
                                <tr key={s.id} className="hover:bg-amber-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                {s.username.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-semibold text-gray-800">{s.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {s.username === 'admin' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                                <Shield className="w-3 h-3" /> Admin
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                                Staff
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {editingId === s.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="password"
                                                    placeholder="New Password"
                                                    className="border border-gray-200 p-2 rounded-lg text-sm w-36 focus:ring-2 focus:ring-amber-400 outline-none"
                                                    value={newPassword}
                                                    onChange={e => setNewPassword(e.target.value)}
                                                />
                                                <button onClick={() => handleUpdatePassword(s.id)} className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 p-1.5 rounded-lg border border-emerald-200 transition-colors">
                                                    <Save className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => { setEditingId(null); setNewPassword('') }} className="text-gray-500 hover:text-gray-700 bg-gray-50 p-1.5 rounded-lg border border-gray-200 transition-colors">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {editingId !== s.id && (
                                                <button
                                                    onClick={() => { setEditingId(s.id); setNewPassword('') }}
                                                    className="text-amber-600 hover:text-amber-800 bg-amber-50 p-2 rounded-lg transition-colors border border-amber-200"
                                                    title="Change Password"
                                                >
                                                    <Key className="w-4 h-4" />
                                                </button>
                                            )}
                                            {s.username !== 'admin' && (
                                                <button
                                                    onClick={() => handleDelete(s.id)}
                                                    className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition-colors border border-red-200"
                                                    title="Delete Staff"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
