import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const items = await prisma.menuItem.findMany({
            orderBy: { category: 'asc' }
        })
        return NextResponse.json(items)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, category, price } = body

        if (!name || !category || !price) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const newItem = await prisma.menuItem.create({
            data: {
                name,
                category,
                price: parseFloat(price),
                isAvailable: true
            }
        })
        return NextResponse.json(newItem)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
    }
}
