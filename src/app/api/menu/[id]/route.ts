import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        const item = await prisma.menuItem.findUnique({ where: { id } })
        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })
        return NextResponse.json(item)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        const body = await request.json()
        const { isAvailable, price, name, category } = body

        const data: any = {}
        if (isAvailable !== undefined) data.isAvailable = isAvailable
        if (price !== undefined) data.price = parseFloat(price)
        if (name !== undefined) data.name = name
        if (category !== undefined) data.category = category

        const updatedItem = await prisma.menuItem.update({
            where: { id },
            data
        })
        return NextResponse.json(updatedItem)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        await prisma.menuItem.delete({
            where: { id }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
    }
}
