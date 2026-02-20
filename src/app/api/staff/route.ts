import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const staff = await prisma.staff.findMany({
            select: { id: true, username: true, createdAt: true }
        })
        return NextResponse.json(staff)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json()
        // In production, hash password here
        const staff = await prisma.staff.create({
            data: { username, password }
        })
        return NextResponse.json({ id: staff.id, username: staff.username })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const { id, password } = await request.json()
        if (!id || !password) return NextResponse.json({ error: 'ID and password required' }, { status: 400 })

        await prisma.staff.update({
            where: { id },
            data: { password }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

        await prisma.staff.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 })
    }
}
