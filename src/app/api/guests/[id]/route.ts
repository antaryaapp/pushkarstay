import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params
        const id = idStr
        const body = await request.json()
        const { name, mobile, city, paymentMode } = body

        const updatedGuest = await prisma.guest.update({
            where: { id },
            data: {
                name,
                mobile,
                city,
                paymentMode
            }
        })
        return NextResponse.json(updatedGuest)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update guest' }, { status: 500 })
    }
}
