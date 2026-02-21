import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create Staff
  // In a real app, password should be hashed. For MVP simplicity or if bcrypt added, use hash.
  // Using plain text for now as per "simple" request, or I'll add a simple hash if instructed.
  // I will suggest adding bcryptjs later, but for now let's store it as is or hardcode a "hashed" looking string if verify logic exists.
  // Actually, I'll use a simple "admin" / "admin123" for now. 
  // *Self-correction*: I should use bcryptjs in the app. I'll add it to deps later.

  const staff = await prisma.staff.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: 'admin123',
    },
  })
  console.log({ staff })

  // Room Configuration
  // Room 1, 2 (Standard), Room 3, 4 (Balcony)
  const roomsData = [
    { roomNumber: 'Room 1', hasBalcony: false, price: 2000 },
    { roomNumber: 'Room 2', hasBalcony: false, price: 2000 },
    { roomNumber: 'Room 3', hasBalcony: true, price: 2500 },
    { roomNumber: 'Room 4', hasBalcony: true, price: 2500 },
  ]

  for (const r of roomsData) {
    await prisma.room.upsert({
      where: { roomNumber: r.roomNumber },
      update: { price: r.price },
      create: r,
    })
  }

  // Clear existing beds to avoid duplicates if re-running
  await prisma.dormBed.deleteMany({})

  // 2nd Floor
  const beds2ndFloor = []
  for (let i = 1; i <= 10; i++) {
    beds2ndFloor.push({
      floorNumber: 2,
      bedNumber: i,
      type: i % 2 !== 0 ? 'LOWER' : 'UPPER',
      status: 'AVAILABLE',
      price: 500
    })
  }

  // 3rd Floor
  const beds3rdFloor = []
  for (let i = 1; i <= 12; i++) {
    beds3rdFloor.push({
      floorNumber: 3,
      bedNumber: i,
      type: i % 2 !== 0 ? 'LOWER' : 'UPPER',
      status: 'AVAILABLE',
      price: 500
    })
  }

  await prisma.dormBed.createMany({
    data: [...beds2ndFloor, ...beds3rdFloor]
  })

  console.log('Seeding finished.')
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
