import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        // TODO: Add authentication check here
        // const session = await getSession(request)
        // if (!session?.user?.isAdmin) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        // }

        await prisma.$transaction([
            // Delete all food orders
            prisma.foodOrder.deleteMany({}),
            // Delete all guests
            prisma.guest.deleteMany({}),
            // Reset all rooms to AVAILABLE
            prisma.room.updateMany({
                data: { status: 'AVAILABLE' }
            }),
            // Reset all dorm beds to AVAILABLE
            prisma.dormBed.updateMany({
                data: { status: 'AVAILABLE' }
            })
        ])

        return NextResponse.json({ success: true, message: 'All guest and order data has been reset.' })
    } catch (error) {
        console.error('Reset data failed:', error)
        return NextResponse.json({ error: 'Failed to reset data' }, { status: 500 })
    }
}