import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json()
        
        if (!params.id) {
            return NextResponse.json({ error: 'Guest ID is required' }, { status: 400 })
        }

        const guest = await prisma.guest.update({
            where: { id: params.id },
            data: body
        })
        return NextResponse.json(guest)
    } catch (error: any) {
        console.error('Update guest error:', error)
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
        }
        return NextResponse.json({ error: 'Failed to update guest' }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        if (!params.id) {
            return NextResponse.json({ error: 'Guest ID is required' }, { status: 400 })
        }

        const id = params.id

        // Use a transaction to ensure all associated data is handled
        await prisma.$transaction(async (tx) => {
            // Get guest to find associated room/bed
            const guest = await tx.guest.findUnique({
                where: { id },
                include: { room: true, dormBed: true }
            })

            if (guest) {
                // Free up accommodation if they were checked in
                if (guest.status === 'CHECKED_IN') {
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
                }

                // Delete all food orders for this guest
                await tx.foodOrder.deleteMany({
                    where: { guestId: id }
                })

                // Finally delete the guest
                await tx.guest.delete({
                    where: { id }
                })
            }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Delete guest failed:', error)
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
        }
        return NextResponse.json({ error: 'Failed to delete guest' }, { status: 500 })
    }
}