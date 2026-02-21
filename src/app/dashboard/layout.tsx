'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard, Users, LogOut, BarChart,
    UtensilsCrossed, BookOpen, UsersRound,
    Menu, X, ChefHat
} from 'lucide-react'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [userRole, setUserRole] = useState<string | null>(null)
    const pathname = usePathname()

    useEffect(() => {
        // Read cookie on client side
        const cookies = document.cookie.split(';')
        const hostelUser = cookies.find(c => c.trim().startsWith('hostel_user='))
        if (hostelUser) {
            setUserRole(hostelUser.split('=')[1])
        }
    }, [])

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false)
    }, [pathname])

    const isActive = (href: string) => pathname === href

    const navLinkClass = (href: string) =>
        `flex items-center gap-3 px-4 py-3 font-semibold rounded-xl transition-all duration-200 ${isActive(href)
            ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
            : 'text-gray-700 hover:bg-amber-50 hover:text-amber-800'
        }`

    const iconClass = (href: string) =>
        `w-5 h-5 ${isActive(href) ? 'text-white' : 'text-amber-600'}`

    const navLinks = [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', adminOnly: false },
        { href: '/dashboard/guests', icon: UsersRound, label: 'All Guests', adminOnly: false },
        { href: '/dashboard/menu', icon: ChefHat, label: 'Menu Management', adminOnly: false },
        { href: '/dashboard/food-bills', icon: UtensilsCrossed, label: 'Food Bills', adminOnly: false },
        { href: '/dashboard/group-booking', icon: BookOpen, label: 'Group Booking', adminOnly: false },
        { href: '/dashboard/staff', icon: Users, label: 'Staff Management', adminOnly: true },
        { href: '/dashboard/reports', icon: BarChart, label: 'Reports & Data', adminOnly: true },
    ]

    const SidebarContent = () => (
        <>
            <div className="p-6 border-b border-amber-100">
                <h1 className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                    PushkarStay
                </h1>
                <p className="text-xs text-gray-400 mt-1 font-medium">Varanasi</p>
            </div>

            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                {navLinks.map(({ href, icon: Icon, label, adminOnly }) => {
                    if (adminOnly && userRole !== 'admin') return null
                    return (
                        <Link key={href} href={href} className={navLinkClass(href)}>
                            <Icon className={iconClass(href)} />
                            {label}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-amber-100">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 text-red-500 font-semibold hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </Link>
            </div>
        </>
    )

    return (
        <div className="flex h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
            {/* Desktop Sidebar */}
            <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-amber-100 hidden md:flex flex-col shadow-lg shadow-amber-50">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 w-72 bg-white z-50 flex flex-col shadow-2xl
                transform transition-transform duration-300 ease-out md:hidden
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-5 right-4 p-1 text-gray-400 hover:text-gray-700 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Mobile Header */}
                <header className="bg-white/80 backdrop-blur-xl border-b border-amber-100 p-4 md:hidden flex justify-between items-center sticky top-0 z-30 shadow-sm">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 hover:bg-amber-50 rounded-xl transition-colors"
                    >
                        <Menu className="w-6 h-6 text-amber-700" />
                    </button>
                    <h1 className="font-black text-xl bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                        PushkarStay
                    </h1>
                    <div className="w-10" /> {/* Spacer for centering */}
                </header>
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
