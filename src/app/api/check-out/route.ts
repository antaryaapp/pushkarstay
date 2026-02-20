import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const { guestId, roomId, dormBedId } = await request.json()

        // We can check out by Guest ID or by Room/Bed ID (finding the active guest)
        let targetGuestId = guestId

        if (!targetGuestId) {
            // Find active guest in room/bed
            if (roomId) {
                const room = await prisma.room.findUnique({
                    where: { id: parseInt(roomId) },
                    include: { guests: { where: { status: 'CHECKED_IN' } } }
                })
                targetGuestId = room?.guests[0]?.id
            } else if (dormBedId) {
                const bed = await prisma.dormBed.findUnique({
                    where: { id: parseInt(dormBedId) },
                    include: { guests: { where: { status: 'CHECKED_IN' } } }
                })
                targetGuestId = bed?.guests[0]?.id
            }
        }

        if (!targetGuestId) {
            return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
        }

        const result = await prisma.$transaction(async (tx) => {
            // Calculate final bill (re-run logic or accept from frontend? Safer to re-run or simplified)
            // For MVP, if we want accurate historical record, we should replicate the logic or call a helper
            // Let's do a quick calc here or just default if complex. 
            // Better: Fetch details to calc.

            const fullGuest = await tx.guest.findUnique({
                where: { id: targetGuestId },
                include: { room: true, dormBed: true, orders: true }
            })

            if (!fullGuest) throw new Error("Guest not found during checkout")

            const checkIn = new Date(fullGuest.checkInDate)
            const checkOut = new Date()
            const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
            let nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            if (nights === 0) nights = 1

            let price = 0
            // if (fullGuest.room) price = fullGuest.room.price
            // if (fullGuest.dormBed) price = fullGuest.dormBed.price
            // Room/Bed price disabled as per user request (Food bill only)

            const accTotal = nights * price
            const foodTotal = fullGuest.orders.reduce((sum, o) => sum + o.totalAmount, 0)
            const finalBill = accTotal + foodTotal

            // Update Guest
            const guest = await tx.guest.update({
                where: { id: targetGuestId },
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

            return guest
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Check-out failed' }, { status: 500 })
    }
}
