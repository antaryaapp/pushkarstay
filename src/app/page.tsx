'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' }
    })

    if (res.ok) {
      router.push('/dashboard')
    } else {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm border border-yellow-200">
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-100 p-3 rounded-full">
            <Lock className="w-8 h-8 text-black" />
          </div>
        </div>
        <h1 className="text-2xl font-black text-center mb-6 text-black">PushkarStay</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-black mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-400 outline-none text-black font-medium"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-black mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-400 outline-none text-black font-medium"
              placeholder="••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition font-bold"
          >
            Sign In
          </button>
        </form>
        <div className="mt-4 text-center">
          <a href="/guest/order" className="text-sm text-black font-bold hover:text-yellow-700 hover:underline">Guest Order Portal →</a>
        </div>
      </div>
    </div>
  )
}
