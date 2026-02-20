import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const guestId = id.trim()

        const guest = await prisma.guest.findUnique({
            where: { id: guestId },
            include: {
                room: true,
                dormBed: true,
                orders: true
            }
        })

        if (!guest) {
            return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
        }

        // Calculate Accommodation
        const checkIn = new Date(guest.checkInDate)
        const checkOut = new Date() // Now

        // Calculate nights (ceiling)
        const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
        let nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        if (nights === 0) nights = 1 // Minimum 1 night charge

        let pricePerNight = 0
        // if (guest.room) pricePerNight = guest.room.price
        // if (guest.dormBed) pricePerNight = guest.dormBed.price
        // Room/Bed price disabled as per user request (Food bill only)

        const accommodationTotal = nights * pricePerNight

        // Calculate Food
        // Calculate Food (Recalculate from items to ensure accuracy and fix legacy data mismatch)
        const foodTotal = guest.orders.reduce((sum, order) => {
            try {
                const items = JSON.parse(order.items as string)
                if (Array.isArray(items) && items.length > 0 && typeof items[0] !== 'string') {
                    // New format: {name, price, qty}
                    const orderSum = items.reduce((oSum: number, item: any) => oSum + (item.price * item.qty), 0)
                    return sum + orderSum
                }
                // Legacy format or empty: ignore or use stored total if trusted, 
                // but user complained about mismatch, so let's trust only valid items.
                // If text only items, we can't calculate price, so we assume 0.
                return sum
            } catch (e) {
                return sum
            }
        }, 0)

        // Total
        const totalBill = accommodationTotal + foodTotal

        return NextResponse.json({
            guestName: guest.name,
            checkIn: guest.checkInDate,
            checkOut: checkOut,
            nights,
            pricePerNight,
            accommodationTotal,
            foodTotal,
            totalBill,
            orders: guest.orders
        })

    } catch (error) {
        return NextResponse.json({ error: 'Failed to calculate bill' }, { status: 500 })
    }
}
