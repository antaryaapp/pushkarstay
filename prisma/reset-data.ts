import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'file:c:/Users/DELL/PUSHKARSTAY/hostel-pms/dev.db',
        },
    },
})

async function main() {
    console.log('--- Starting Database Reset for Live Usage ---')

    console.log('1. Clearing Food Orders...')
    await prisma.foodOrder.deleteMany({})

    console.log('2. Clearing Guests...')
    await prisma.guest.deleteMany({})

    console.log('3. Resetting Room Statuses...')
    await prisma.room.updateMany({ data: { status: 'AVAILABLE' } })

    console.log('4. Resetting Dorm Bed Statuses...')
    await prisma.dormBed.updateMany({ data: { status: 'AVAILABLE' } })

    console.log('--- Database Reset Complete ---')
    console.log('All guests and orders have been removed.')
    console.log('All rooms and beds are now AVAILABLE.')
    console.log('Menu Items and Room/Bed configurations have been preserved.')
}

main()
    .catch(e => {
        console.error('Error during reset:', e)
        process.exit(1)
    })
    .finally(async () => await prisma.$disconnect())
