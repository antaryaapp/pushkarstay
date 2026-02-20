import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (!from || !to) {
        return NextResponse.json({ error: 'Date range required' }, { status: 400 })
    }

    const startDate = new Date(from)
    const endDate = new Date(to) // Current day 23:59:59 usually requested

    // Validation: Max 1 month (approx 31 days)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > 32) { // Allow slight buffer (e.g. 1st to 31st is 30 days diff but spans 31 days)
        return NextResponse.json({ error: 'Range exceeds 1 month limit' }, { status: 400 })
    }

    // Ensure endDate covers the full day
    const queryEndDate = new Date(endDate)
    queryEndDate.setHours(23, 59, 59, 999)

    const startQueryDate = new Date(startDate)
    startQueryDate.setHours(0, 0, 0, 0)

    try {
        const checkouts = await prisma.guest.findMany({
            where: {
                status: 'CHECKED_OUT',
                checkOutDate: {
                    gte: startQueryDate,
                    lte: queryEndDate
                }
            },
            orderBy: { checkOutDate: 'desc' },
            select: {
                name: true,
                checkInDate: true,
                checkOutDate: true,
                totalBill: true,
                mobile: true,
                room: { select: { roomNumber: true } },
                dormBed: { select: { bedNumber: true, floorNumber: true } }
            }
        })

        return NextResponse.json({ checkouts })
    } catch (error) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
}
