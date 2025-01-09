import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { authMiddleware } from '../authmiddleware';

// const prisma = new PrismaClient().$extends(withAccelerate());

export const roomRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    },
    Variables: {
        userId: string
    }
}>();

roomRouter.get('/total', async (c) => {
    let prisma;
    try {
        // Log the DATABASE_URL (but hide sensitive info)
        console.log('Database URL exists:', !!c.env.DATABASE_URL);

        prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        // Try to explicitly connect
        await prisma.$connect();
        console.log('Connected to database');

        const rooms = await prisma.room.findMany();
        console.log('Rooms found:', rooms.length);

        return c.json({
            rooms: rooms
        });
    } catch (error) {
        console.error("Detailed error:", error);
        return c.json({
            message: "Error fetching rooms",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    } finally {
        // Always disconnect
        if (prisma) {
            await prisma.$disconnect();
        }
    }
});

// Protected routes
// roomRouter.use('/*', authMiddleware);

// Get available rooms
roomRouter.get('/available', async (c) => {
    try {
        const { checkInDate, checkOutDate, category } = c.req.query();
        
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        // Add validation
        if (!checkInDate || !checkOutDate) {
            return c.json({ message: "Check-in and check-out dates are required" }, 400);
        }

        const rooms = await prisma.room.findMany({
            where: {
                status: 'AVAILABLE',
                ...(category && { category: category as any }),
                // Exclude rooms with overlapping bookings
                NOT: {
                    bookings: {
                        some: {
                            AND: [
                                { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
                                {
                                    OR: [
                                        {
                                            checkInDate: { lte: new Date(checkOutDate) },
                                            checkOutDate: { gt: new Date(checkInDate) }
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
            },
            include: {
                bookings: {
                    where: {
                        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
                        checkInDate: { lte: new Date(checkOutDate) },
                        checkOutDate: { gte: new Date(checkInDate) }
                    }
                }
            }
        });

        return c.json({
            rooms: rooms.map(room => ({
                ...room,
                availableCapacity: room.capacity - room.bookings.reduce(
                    (sum, booking) => sum + booking.numberOfGuests, 0
                )
            }))
        });
    } catch (error) {
        console.error(error);
        return c.json({
            message: "Error fetching available rooms"
        }, 500);
    }
});

// Create room (master only)
roomRouter.post('/create', async (c) => {
    try {
        const body = await c.req.json();
        const userId = c.get('userId');

        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        // Check if user is master
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (user?.role !== 'MASTER') {
            return c.json({ message: "Unauthorized" }, 403);
        }

        const room = await prisma.room.create({
            data: {
                number: body.number,
                category: body.category,
                capacity: body.capacity,
                pricePerNight: body.pricePerNight,
                amenities: body.amenities,
                description: body.description,
                createdById: userId
            }
        });

        return c.json({ room });
    } catch (error) {
        console.error(error);
        return c.json({
            message: "Error creating room"
        }, 500);
    }
});

// Get single room
roomRouter.get('/:id', async (c) => {
    try {
        const { id } = c.req.param();
        
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        const room = await prisma.room.findUnique({
            where: { id },
            include: {
                bookings: {
                    where: {
                        status: { in: ['CONFIRMED', 'CHECKED_IN'] }
                    },
                    select: {
                        id: true,
                        guestName: true,
                        numberOfGuests: true,
                        checkInDate: true,
                        checkOutDate: true,
                        status: true
                    }
                }
            }
        });

        return c.json({ room });
    } catch (error) {
        console.error(error);
        return c.json({
            message: "Error fetching room"
        }, 500);
    }
});


// Get total rooms with details
