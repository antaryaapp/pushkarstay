import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json()
        console.log("LOGIN REQUEST:", { username, password })

        const staff = await prisma.staff.findUnique({
            where: { username },
        })
        console.log("DB USER FOUND:", staff ? staff.username : "NOT FOUND")
        if (staff) console.log("DB PASS:", staff.password)

        if (!staff) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        // Simple password check (MVP: Plain text)
        if (staff.password !== password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        // Return success with cookie
        const response = NextResponse.json({ success: true, user: { id: staff.id, username: staff.username } })
        response.cookies.set('hostel_user', staff.username, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 // 1 day
        })
        return response

    } catch (error) {
        console.error("LOGIN ERROR:", error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
