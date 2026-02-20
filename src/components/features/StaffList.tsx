"use client"

import { useState } from 'react'
import useSWR from 'swr'
import { Trash2, UserPlus, Key, Save, X } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function StaffList() {
    const { data: staff, mutate } = useSWR('/api/staff', fetcher)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    // Edit Password State
    const [editingId, setEditingId] = useState<string | null>(null)
    const [newPassword, setNewPassword] = useState('')

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await fetch('/api/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            setUsername('')
            setPassword('')
            mutate()
        } catch (error) {
            alert('Failed to add staff')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this staff member?')) return
        try {
            await fetch(`/api/staff?id=${id}`, { method: 'DELETE' })
            mutate()
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
            alert('Password updated successfully')
        } catch (error) {
            alert('Failed to update password')
        }
    }

    if (!staff) return <div className="font-bold">Loading...</div>

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-yellow-200">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-black">
                    <UserPlus className="w-5 h-5 text-black" /> Add New Staff
                </h3>
                <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-bold mb-1 text-black">Username</label>
                        <input
                            value={username} onChange={e => setUsername(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-400 font-medium" required
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-bold mb-1 text-black">Password</label>
                        <input
                            type="password"
                            value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-400 font-medium" required
                        />
                    </div>
                    <button disabled={loading} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 w-full md:w-auto font-bold transition">
                        {loading ? 'Adding...' : 'Add Staff'}
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-yellow-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-yellow-100 border-b border-yellow-200">
                            <tr>
                                <th className="p-4 font-black text-black">Username</th>
                                <th className="p-4 font-black text-black">Created At</th>
                                <th className="p-4 text-right font-black text-black">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-yellow-100">
                            {staff.map((s: any) => (
                                <tr key={s.id} className="last:border-0 hover:bg-yellow-50 transition-colors">
                                    <td className="p-4 font-bold text-black">{s.username}</td>

                                    <td className="p-4">
                                        {editingId === s.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="password"
                                                    placeholder="New Password"
                                                    className="border p-1 rounded text-sm w-32 border-yellow-300"
                                                    value={newPassword}
                                                    onChange={e => setNewPassword(e.target.value)}
                                                />
                                                <button onClick={() => handleUpdatePassword(s.id)} className="text-green-900 hover:text-green-700 bg-green-200 p-1 rounded border border-green-300">
                                                    <Save className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => { setEditingId(null); setNewPassword('') }} className="text-red-900 hover:text-red-700 bg-red-200 p-1 rounded border border-red-300">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-black font-medium">{new Date(s.createdAt).toLocaleDateString()}</span>
                                        )}
                                    </td>

                                    <td className="p-4 text-right flex justify-end gap-2">
                                        {editingId !== s.id && (
                                            <button
                                                onClick={() => { setEditingId(s.id); setNewPassword('') }}
                                                className="text-black hover:text-yellow-900 bg-yellow-200 p-2 rounded-full transition-colors border border-yellow-300"
                                                title="Change Password"
                                            >
                                                <Key className="w-4 h-4" />
                                            </button>
                                        )}
                                        {s.username !== 'admin' && (
                                            <button
                                                onClick={() => handleDelete(s.id)}
                                                className="text-white hover:text-red-100 bg-red-600 p-2 rounded-full transition-colors border border-red-700"
                                                title="Delete Staff"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
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
