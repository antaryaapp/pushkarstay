import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'file:c:/Users/DELL/PUSHKARSTAY/hostel-pms/dev.db',
        },
    },
})

// Helper to calculate days ago/ahead
const daysAgo = (days: number) => {
    const d = new Date()
    d.setDate(d.getDate() - days)
    return d
}

async function main() {
    console.log('--- Starting Test Data Seeding ---')

    // execute seed first to ensure rooms/beds exist? 
    // Usually seed.ts is for structural data. Let's assume seed.ts was run or just run it here if needed.
    // For safety, let's verify rooms/beds exist. If not, maybe run seed logic briefly or just fail.
    const roomCount = await prisma.room.count()
    if (roomCount === 0) {
        console.log('No rooms found. Please run "npx prisma rsie seed" or "npx tsx prisma/seed.ts" first.')
        // or just create them here quickly
    }

    console.log('Cleaning up existing Guests/Orders for clean state...')
    await prisma.foodOrder.deleteMany({});
    await prisma.guest.deleteMany({});
    // We don't delete Rooms/DormBeds as we want to keep structure.
    // Reset room/bed status to AVAILABLE
    await prisma.room.updateMany({ data: { status: 'AVAILABLE' } })
    await prisma.dormBed.updateMany({ data: { status: 'AVAILABLE' } })


    // --- Create Guests in Rooms ---
    console.log('Creating Room Guests...')

    // Guest 1: Active in Room 1
    const room1 = await prisma.room.findUnique({ where: { roomNumber: 'Room 1' } });
    if (room1) {
        await prisma.guest.create({
            data: {
                name: 'Rahul Sharma',
                mobile: '9876543210',
                city: 'Delhi',
                paymentMode: 'UPI',
                checkInDate: daysAgo(2),
                status: 'CHECKED_IN',
                roomId: room1.id,
                totalBill: 0,
                orders: {
                    create: [
                        { items: JSON.stringify([{ name: 'Tea', price: 10, qty: 2 }]), totalAmount: 20, status: 'COMPLETED', createdAt: daysAgo(2) },
                        { items: JSON.stringify([{ name: 'Sandwich', price: 50, qty: 1 }]), totalAmount: 50, status: 'PENDING' }
                    ]
                }
            }
        });
        await prisma.room.update({ where: { id: room1.id }, data: { status: 'OCCUPIED' } })
    }

    // Guest 2: Checked Out from Room 2 (History)
    const room2 = await prisma.room.findUnique({ where: { roomNumber: 'Room 2' } });
    if (room2) {
        await prisma.guest.create({
            data: {
                name: 'Anjali Verma',
                mobile: '9988776655',
                city: 'Mumbai',
                paymentMode: 'CASH',
                checkInDate: daysAgo(5),
                checkOutDate: daysAgo(1),
                status: 'CHECKED_OUT',
                roomId: room2.id, // Keeps reference usually, or null if strictly cleared. Schema allows it.
                totalBill: 6000,
            }
        });
        // Room 2 remains AVAILABLE
    }

    // --- Create Guests in Dorms ---
    console.log('Creating Dorm Guests...')

    const beds = await prisma.dormBed.findMany({ take: 5 });

    // Guest 3: Active in Bed 1
    if (beds[0]) {
        await prisma.guest.create({
            data: {
                name: 'Suresh Kumar',
                mobile: '9123456789',
                city: 'Jaipur',
                paymentMode: 'CASH',
                checkInDate: daysAgo(1),
                status: 'CHECKED_IN',
                dormBedId: beds[0].id,
                totalBill: 0,
                orders: {
                    create: [
                        { items: JSON.stringify([{ name: 'Thali', price: 120, qty: 1 }]), totalAmount: 120, status: 'COMPLETED' }
                    ]
                }
            }
        });
        await prisma.dormBed.update({ where: { id: beds[0].id }, data: { status: 'OCCUPIED' } })
    }

    // Guest 4: Active in Bed 2
    if (beds[1]) {
        await prisma.guest.create({
            data: {
                name: 'Amit Patel',
                mobile: '8899001122',
                city: 'Ahmedabad',
                paymentMode: 'UPI',
                checkInDate: new Date(), // Checked in today
                status: 'CHECKED_IN',
                dormBedId: beds[1].id,
                totalBill: 0,
            }
        });
        await prisma.dormBed.update({ where: { id: beds[1].id }, data: { status: 'OCCUPIED' } })
    }

    // --- Create Menu Items ---
    console.log('Creating Menu Items...')
    await prisma.menuItem.deleteMany({}) // optional clear
    const menuItems = [
        { name: 'Aloo Paratha', category: 'Breakfast', price: 50 },
        { name: 'Poha', category: 'Breakfast', price: 40 },
        { name: 'Thali (Veg)', category: 'Lunch', price: 120 },
        { name: 'Thali (Non-Veg)', category: 'Lunch', price: 180 },
        { name: 'Tea', category: 'Beverages', price: 15 },
        { name: 'Coffee', category: 'Beverages', price: 25 },
        { name: 'Samosa', category: 'Snacks', price: 20 },
        { name: 'Sandwich', category: 'Snacks', price: 60 },
        { name: 'Chicken Curry', category: 'Dinner', price: 200 },
        { name: 'Paneer Butter Masala', category: 'Dinner', price: 160 },
    ]

    for (const item of menuItems) {
        await prisma.menuItem.create({ data: item })
    }

    // --- Preview Output ---
    const allGuests = await prisma.guest.findMany({
        include: { orders: true, room: true, dormBed: true }
    });

    console.log('\n--- Test Data Preview ---');
    console.table(allGuests.map(g => ({
        Name: g.name,
        Status: g.status,
        'Room/Bed': g.room ? g.room.roomNumber : (g.dormBed ? `Bed ${g.dormBed.bedNumber}` : 'N/A'),
        Orders: g.orders.length,
        'Total Bill': g.totalBill
    })));

    console.log('\n--- Summary ---');
    console.log(`Total Guests Created: ${allGuests.length}`);
    console.log(`Total Active Rooms: ${await prisma.room.count({ where: { status: 'OCCUPIED' } })}`);
    console.log(`Total Active Beds: ${await prisma.dormBed.count({ where: { status: 'OCCUPIED' } })}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
