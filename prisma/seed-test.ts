import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding test data...')

    // Clear Guests and Orders
    await prisma.foodOrder.deleteMany({})
    await prisma.guest.deleteMany({})
    // Reset Room status
    await prisma.room.updateMany({ data: { status: 'AVAILABLE' } })
    await prisma.dormBed.updateMany({ data: { status: 'AVAILABLE' } })

    // 1. Check in a guest to Room 1
    const guest1 = await prisma.guest.create({
        data: {
            name: 'Rahul Sharma',
            mobile: '9876543210',
            city: 'Delhi',
            paymentMode: 'UPI',
            checkInDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
            room: { connect: { roomNumber: 'Room 1' } },
            status: 'CHECKED_IN'
        }
    })
    await prisma.room.update({ where: { roomNumber: 'Room 1' }, data: { status: 'OCCUPIED' } })

    // 2. Check in a guest to Bed 1 (Floor 2)
    const bed1 = await prisma.dormBed.findFirst({ where: { floorNumber: 2, bedNumber: 1 } })
    const guest2 = await prisma.guest.create({
        data: {
            name: 'Amit Kumar',
            mobile: '9123456780',
            city: 'Pune',
            paymentMode: 'CASH',
            checkInDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
            dormBed: { connect: { id: bed1?.id } },
            status: 'CHECKED_IN'
        }
    })
    if (bed1) await prisma.dormBed.update({ where: { id: bed1.id }, data: { status: 'OCCUPIED' } })

    // 3. Add Orders
    console.log('Adding orders...')

    // Guest 1 Orders
    await prisma.foodOrder.create({
        data: {
            guestId: guest1.id,
            items: JSON.stringify(['Burger', 'Coke']),
            totalAmount: 200,
            status: 'COMPLETED'
        }
    })

    await prisma.foodOrder.create({
        data: {
            guestId: guest1.id,
            items: JSON.stringify(['Tea']),
            totalAmount: 15,
            status: 'PENDING'
        }
    })

    // Guest 2 Orders (None)

    console.log('Test data seeded!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
