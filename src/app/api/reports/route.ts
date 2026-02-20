import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // Today's stats
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const todayOrders = await prisma.foodOrder.findMany({
            where: { createdAt: { gte: startOfDay } }
        })

        const todayCheckIns = await prisma.guest.findMany({
            where: { checkInDate: { gte: startOfDay } }
        })

        const activeGuests = await prisma.guest.count({
            where: { status: 'CHECKED_IN' }
        })

        const totalRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0)

        // Recent Checked Out Guests with Bill
        const recentCheckouts = await prisma.guest.findMany({
            where: { status: 'CHECKED_OUT' },
            orderBy: { checkOutDate: 'desc' },
            take: 10
        })

        return NextResponse.json({
            todayOrdersCount: todayOrders.length,
            todayCheckInsCount: todayCheckIns.length,
            activeGuestsCount: activeGuests,
            todayRevenue: totalRevenue,
            recentCheckouts
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
    }
}
