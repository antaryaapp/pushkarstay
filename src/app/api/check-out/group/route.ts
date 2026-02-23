import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const { guestIds } = await request.json()

        if (!guestIds || !Array.isArray(guestIds) || guestIds.length === 0) {
            return NextResponse.json({ error: 'No guests selected for checkout' }, { status: 400 })
        }

        const result = await prisma.$transaction(async (tx) => {
            const results = []

            for (const guestId of guestIds) {
                const fullGuest = await tx.guest.findUnique({
                    where: { id: guestId },
                    include: { room: true, dormBed: true, orders: true }
                })

                if (!fullGuest || fullGuest.status === 'CHECKED_OUT') continue

                const checkIn = new Date(fullGuest.checkInDate)
                const checkOut = new Date()
                const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
                let nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                if (nights === 0) nights = 1

                // For MVP, using same logic as individual checkout
                const foodTotal = fullGuest.orders.reduce((sum, o) => sum + o.totalAmount, 0)
                const finalBill = foodTotal // Accommodation price disabled as per previous requests

                // Update Guest
                const guest = await tx.guest.update({
                    where: { id: guestId },
                    data: {
                        status: 'CHECKED_OUT',
                        checkOutDate: checkOut,
                        totalBill: finalBill
                    }
                })

                // Free up accommodation
                if (guest.roomId) {
                    await tx.room.update({
                        where: { id: guest.roomId },
                        data: { status: 'AVAILABLE' }
                    })
                } else if (guest.dormBedId) {
                    await tx.dormBed.update({
                        where: { id: guest.dormBedId },
                        data: { status: 'AVAILABLE' }
                    })
                }
                results.push(guest)
            }

            return results
        })

        return NextResponse.json({ success: true, checkedOutCount: result.length })
    } catch (error) {
        console.error('Group check-out failed', error)
        return NextResponse.json({ error: 'Group check-out failed' }, { status: 500 })
    }
}
