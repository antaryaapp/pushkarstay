import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        // Authenticate - For now, we assume only admin can call this
        // In a real app, check session/token here.

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
