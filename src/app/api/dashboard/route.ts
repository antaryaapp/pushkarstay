import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const rooms = await prisma.room.findMany({
            include: {
                guests: {
                    where: { status: 'CHECKED_IN' }
                }
            },
            orderBy: { id: 'asc' }
        })

        const dormBeds = await prisma.dormBed.findMany({
            include: {
                guests: {
                    where: { status: 'CHECKED_IN' }
                }
            },
            orderBy: { id: 'asc' }
        })

        return NextResponse.json({ rooms, dormBeds })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
    }
}
