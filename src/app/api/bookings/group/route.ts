import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { guestDetails, roomIds, dormBedIds } = body
        // guestDetails: { name, mobile, city, paymentMode }
        // roomIds: number[]
        // dormBedIds: number[]

        if ((!roomIds || roomIds.length === 0) && (!dormBedIds || dormBedIds.length === 0)) {
            return NextResponse.json({ error: 'No rooms or beds selected' }, { status: 400 })
        }

        const result = await prisma.$transaction(async (tx) => {
            const createdGuests = []

            // Process Rooms
            if (roomIds && roomIds.length > 0) {
                for (const roomId of roomIds) {
                    // Create guest for this room
                    const guest = await tx.guest.create({
                        data: {
                            name: guestDetails.name + " (Group)", // Append group marker or keep same? User said "group booking".
                            // Maybe just use the name. It's okay to have duplicates.
                            // User said "update the details... no need to update in every bed".
                            // So we copy the details.
                            mobile: guestDetails.mobile,
                            city: guestDetails.city,
                            paymentMode: guestDetails.paymentMode,
                            roomId: roomId,
                            status: 'CHECKED_IN'
                        }
                    })
                    // Update Room Status
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
                            name: guestDetails.name + " (Group)",
                            mobile: guestDetails.mobile,
                            city: guestDetails.city,
                            paymentMode: guestDetails.paymentMode,
                            dormBedId: bedId,
                            status: 'CHECKED_IN'
                        }
                    })
                    // Update Bed Status
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
