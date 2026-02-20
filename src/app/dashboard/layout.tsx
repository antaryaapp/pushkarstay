import { cookies } from 'next/headers'
import Link from 'next/link'
import { LayoutDashboard, Users, LogOut, BarChart } from 'lucide-react'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies()
    const userRole = cookieStore.get('hostel_user')?.value

    return (
        <div className="flex h-screen bg-yellow-50">
            {/* Sidebar */}
            <aside className="w-64 bg-yellow-50 border-r border-yellow-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-yellow-200">
                    <h1 className="text-2xl font-black text-black">PushkarStay</h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-black font-medium hover:bg-yellow-200 rounded-lg transition"
                    >
                        <LayoutDashboard className="w-5 h-5 text-black" />
                        Dashboard
                    </Link>

                    {userRole === 'admin' && (
                        <>
                            <Link
                                href="/dashboard/staff"
                                className="flex items-center gap-3 px-4 py-3 text-black font-medium hover:bg-yellow-200 rounded-lg transition"
                            >
                                <Users className="w-5 h-5 text-black" />
                                Staff Management
                            </Link>

                            <Link
                                href="/dashboard/reports"
                                className="flex items-center gap-3 px-4 py-3 text-black font-medium hover:bg-yellow-200 rounded-lg transition"
                            >
                                <BarChart className="w-5 h-5 text-black" />
                                Reports & Data
                            </Link>
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-yellow-200">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 text-red-600 font-bold hover:bg-red-50 rounded-lg transition"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-yellow-50">
                <header className="bg-yellow-50 border-b border-yellow-200 p-4 md:hidden flex justify-between items-center">
                    <h1 className="font-black text-black text-xl">PushkarStay</h1>
                    {/* Mobile menu toggle could go here */}
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
