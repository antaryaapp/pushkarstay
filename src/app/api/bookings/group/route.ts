import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { guestDetails, roomIds, dormBedIds } = body
        const groupId = crypto.randomUUID()

        if ((!roomIds || roomIds.length === 0) && (!dormBedIds || dormBedIds.length === 0)) {
            return NextResponse.json({ error: 'No rooms or beds selected' }, { status: 400 })
        }

        const result = await prisma.$transaction(async (tx) => {
            const createdGuests = []

            // Process Rooms
            if (roomIds && roomIds.length > 0) {
                for (const roomId of roomIds) {
                    const guest = await tx.guest.create({
                        data: {
                            name: guestDetails.name,
                            mobile: guestDetails.mobile,
                            city: guestDetails.city,
                            paymentMode: guestDetails.paymentMode,
                            roomId: roomId,
                            groupId: groupId,
                            status: 'CHECKED_IN'
                        }
                    })
                    await tx.room.update({
                        where: { id: roomId },
                        data: { status: 'OCCUPIED' }
                    })
                    createdGuests.push(guest)
                }
            }

            // Process Dorm Beds
            if (dormBedIds && dormBedIds.length > 0) {
                for (const bedId of dormBedIds) {
                    const guest = await tx.guest.create({
                        data: {
                            name: guestDetails.name,
                            mobile: guestDetails.mobile,
                            city: guestDetails.city,
                            paymentMode: guestDetails.paymentMode,
                            dormBedId: bedId,
                            groupId: groupId,
                            status: 'CHECKED_IN'
                        }
                    })
                    await tx.dormBed.update({
                        where: { id: bedId },
                        data: { status: 'OCCUPIED' }
                    })
                    createdGuests.push(guest)
                }
            }
            return createdGuests
        })

        return NextResponse.json({ success: true, count: result.length })

    } catch (error) {
        console.error('Group booking failed', error)
        return NextResponse.json({ error: 'Group booking failed' }, { status: 500 })
    }
}
