import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where = status ? { status } : {}

    const orders = await prisma.foodOrder.findMany({
        where,
        include: { guest: { include: { room: true, dormBed: true } } }, // Include location context
        orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
}

import { calculateOrderTotal } from '@/lib/menu'

export async function POST(request: Request) {
    try {
        const { guestId, items } = await request.json()

        // items should be array of strings ["Burger", "Coke"]
        // If it comes as JSON string, parse it first
        const parsedItems = typeof items === 'string' ? JSON.parse(items) : items
        const totalAmount = calculateOrderTotal(parsedItems)

        const order = await prisma.foodOrder.create({
            data: {
                guestId,
                items: JSON.stringify(parsedItems),
                totalAmount,
                status: 'PENDING'
            }
        })

        return NextResponse.json(order)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Order failed' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const { id, status } = await request.json()
        const order = await prisma.foodOrder.update({
            where: { id },
            data: { status }
        })
        return NextResponse.json(order)
    } catch (e) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

        await prisma.foodOrder.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    }
}
