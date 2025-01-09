import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create users
  const masterUser = await prisma.user.create({
    data: {
      email: "master@example.com",
      username: "masteruser",
      password: "securepassword",
      role: "MASTER",
      name: "Master Admin",
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@example.com",
      username: "adminuser",
      password: "securepassword",
      role: "ADMIN",
      name: "Admin User",
    },
  });

  // Create rooms
  const standardRooms = [];
  const deluxeRooms = [];
  const suiteRooms = [];

  for (let i = 101; i <= 110; i++) {
    standardRooms.push(
      await prisma.room.create({
        data: {
          number: `${i}`,
          category: "STANDARD",
          capacity: 10,
          pricePerNight: 100.0,
          amenities: ["WiFi", "Air Conditioning"],
          description: `A cozy standard room with number ${i}.`,
          createdById: masterUser.id,
        },
      })
    );
  }
  for (let i = 401; i <= 410; i++) {
    standardRooms.push(
      await prisma.room.create({
        data: {
          number: `${i}`,
          category: "PRESIDENTIAL",
          capacity: 10,
          pricePerNight: 100.0,
          amenities: ["WiFi", "Air Conditioning"],
          description: `A cozy standard room with number ${i}.`,
          createdById: masterUser.id,
        },
      })
    );
  }

  for (let i = 201; i <= 210; i++) {
    deluxeRooms.push(
      await prisma.room.create({
        data: {
          number: `${i}`,
          category: "DELUXE",
          capacity: 10,
          pricePerNight: 200.0,
          amenities: ["WiFi", "Air Conditioning", "Mini Bar"],
          description: `A luxurious deluxe room with number ${i}.`,
          createdById: adminUser.id,
        },
      })
    );
  }

  for (let i = 301; i <= 310; i++) {
    suiteRooms.push(
      await prisma.room.create({
        data: {
          number: `${i}`,
          category: "SUITE",
          capacity: 10,
          pricePerNight: 500.0,
          amenities: ["WiFi", "Air Conditioning", "Mini Bar", "Jacuzzi"],
          description: `An exclusive suite room with number ${i}.`,
          createdById: masterUser.id,
        },
      })
    );
  }

  console.log("Rooms seeded successfully!");

  // Create bookings for only rooms 101 and 201
  if (standardRooms[0] && deluxeRooms[0]) {
    await prisma.booking.create({
      data: {
        guestName: "John Doe",
        identityCard: "A12345678",
        identityType: "PASSPORT",
        numberOfGuests: 2,
        checkInDate: new Date("2025-01-10"),
        checkOutDate: new Date("2025-01-15"),
        totalAmount: 500.0,
        status: "CONFIRMED",
        specialRequests: "Ocean view",
        contactNumber: "1234567890",
        contactEmail: "johndoe@example.com",
        roomId: standardRooms[0].id, // Room 101
        bookedById: adminUser.id,
      },
    });

    await prisma.booking.create({
      data: {
        guestName: "Jane Smith",
        identityCard: "B98765432",
        identityType: "DRIVER_LICENSE",
        numberOfGuests: 1,
        checkInDate: new Date("2025-01-12"),
        checkOutDate: new Date("2025-01-14"),
        totalAmount: 400.0,
        status: "CHECKED_IN",
        contactNumber: "0987654321",
        contactEmail: "janesmith@example.com",
        roomId: deluxeRooms[0].id, // Room 201
        bookedById: masterUser.id,
      },
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
