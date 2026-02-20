import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const indianMenuItems = [
    // Breakfast
    { name: 'Aloo Paratha', category: 'Breakfast', price: 80, isAvailable: true },
    { name: 'Poha', category: 'Breakfast', price: 50, isAvailable: true },
    { name: 'Idli Sambhar', category: 'Breakfast', price: 60, isAvailable: true },
    { name: 'Chole Bhature', category: 'Breakfast', price: 90, isAvailable: true },
    { name: 'Bread Omelette', category: 'Breakfast', price: 60, isAvailable: true },
    { name: 'Paneer Paratha', category: 'Breakfast', price: 90, isAvailable: true },
    { name: 'Upma', category: 'Breakfast', price: 50, isAvailable: true },
    { name: 'Toast Butter Jam', category: 'Breakfast', price: 40, isAvailable: true },
    { name: 'Dosa', category: 'Breakfast', price: 70, isAvailable: true },

    // Lunch
    { name: 'Veg Thali', category: 'Lunch', price: 150, isAvailable: true },
    { name: 'Dal Rice', category: 'Lunch', price: 100, isAvailable: true },
    { name: 'Rajma Chawal', category: 'Lunch', price: 120, isAvailable: true },
    { name: 'Paneer Butter Masala', category: 'Lunch', price: 160, isAvailable: true },
    { name: 'Mix Veg Curry + Roti', category: 'Lunch', price: 130, isAvailable: true },
    { name: 'Egg Curry + Rice', category: 'Lunch', price: 120, isAvailable: true },
    { name: 'Kadhi Chawal', category: 'Lunch', price: 100, isAvailable: true },
    { name: 'Jeera Rice + Dal', category: 'Lunch', price: 110, isAvailable: true },

    // Dinner
    { name: 'Roti Sabzi (4 Roti)', category: 'Dinner', price: 100, isAvailable: true },
    { name: 'Dal Makhani + Naan', category: 'Dinner', price: 140, isAvailable: true },
    { name: 'Paneer Tikka Masala', category: 'Dinner', price: 170, isAvailable: true },
    { name: 'Veg Biryani', category: 'Dinner', price: 150, isAvailable: true },
    { name: 'Chana Masala + Rice', category: 'Dinner', price: 110, isAvailable: true },
    { name: 'Aloo Gobi + Roti', category: 'Dinner', price: 100, isAvailable: true },
    { name: 'Palak Paneer + Naan', category: 'Dinner', price: 150, isAvailable: true },

    // Snacks
    { name: 'Maggi', category: 'Snacks', price: 40, isAvailable: true },
    { name: 'Samosa (2 pcs)', category: 'Snacks', price: 30, isAvailable: true },
    { name: 'Veg Sandwich', category: 'Snacks', price: 50, isAvailable: true },
    { name: 'French Fries', category: 'Snacks', price: 60, isAvailable: true },
    { name: 'Pakode', category: 'Snacks', price: 40, isAvailable: true },
    { name: 'Bread Pakora', category: 'Snacks', price: 40, isAvailable: true },
    { name: 'Momos (8 pcs)', category: 'Snacks', price: 70, isAvailable: true },
    { name: 'Spring Roll', category: 'Snacks', price: 60, isAvailable: true },

    // Beverages
    { name: 'Chai', category: 'Beverages', price: 20, isAvailable: true },
    { name: 'Coffee', category: 'Beverages', price: 30, isAvailable: true },
    { name: 'Lassi (Sweet)', category: 'Beverages', price: 50, isAvailable: true },
    { name: 'Lassi (Salted)', category: 'Beverages', price: 50, isAvailable: true },
    { name: 'Fresh Lime Soda', category: 'Beverages', price: 40, isAvailable: true },
    { name: 'Mango Shake', category: 'Beverages', price: 60, isAvailable: true },
    { name: 'Banana Shake', category: 'Beverages', price: 50, isAvailable: true },
    { name: 'Cold Coffee', category: 'Beverages', price: 50, isAvailable: true },
    { name: 'Water Bottle', category: 'Beverages', price: 20, isAvailable: true },
]

async function seedMenu() {
    console.log('Seeding Indian menu items...')

    for (const item of indianMenuItems) {
        // Upsert by name to avoid duplicates
        const existing = await prisma.menuItem.findFirst({
            where: { name: item.name }
        })

        if (!existing) {
            await prisma.menuItem.create({ data: item })
            console.log(`  ✅ Added: ${item.name} (${item.category}) - ₹${item.price}`)
        } else {
            console.log(`  ⏭️  Skipped (exists): ${item.name}`)
        }
    }

    console.log(`\n✅ Menu seeding done! ${indianMenuItems.length} items processed.`)
}

seedMenu()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error('Seed failed:', e)
        await prisma.$disconnect()
        process.exit(1)
    })
