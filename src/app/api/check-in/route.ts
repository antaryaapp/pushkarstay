import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const { name, roomId, dormBedId, mobile, city, paymentMode } = await request.json()

        if (!name || (!roomId && !dormBedId)) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const result = await prisma.$transaction(async (tx) => {
            // Create Guest
            const guest = await tx.guest.create({
                data: {
                    name,
                    mobile: mobile || "",
                    city: city || "",
                    paymentMode: paymentMode || "CASH",
                    roomId: roomId ? parseInt(roomId) : null,
                    dormBedId: dormBedId ? parseInt(dormBedId) : null,
                    status: 'CHECKED_IN'
                }
            })

            // Update Accommodation Status
            if (roomId) {
                await tx.room.update({
                    where: { id: parseInt(roomId) },
                    data: { status: 'OCCUPIED' }
                })
            } else if (dormBedId) {
                await tx.dormBed.update({
                    where: { id: parseInt(dormBedId) },
                    data: { status: 'OCCUPIED' }
                })
            }

            return guest
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Check-in failed' }, { status: 500 })
    }
}
