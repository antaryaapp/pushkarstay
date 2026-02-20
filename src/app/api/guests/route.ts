import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') // optional filter

        const where: any = {}
        if (status) where.status = status

        const guests = await prisma.guest.findMany({
            where,
            include: {
                room: true,
                dormBed: true
            },
            orderBy: { checkInDate: 'desc' }
        })
        return NextResponse.json(guests)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 })
    }
}
