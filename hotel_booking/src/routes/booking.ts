import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { authMiddleware } from '../authmiddleware';


// Initialize a shared Prisma Client instance with Accelerate extension
// const prisma = new PrismaClient().$extends(withAccelerate());

// Define the booking router
export const bookingRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string;
    },
    Variables: {
        userId: string;
    }
}>();

// Protected routes
bookingRouter.use('/*', authMiddleware);

// Helper function to calculate nights
function calculateNights(checkIn: Date, checkOut: Date): number {
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Create booking
bookingRouter.post('/booking', async (c) => {
    try {
        const body = await c.req.json();
        const userId = c.get('userId');

        // Initialize Prisma client
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        // Check room availability
        const room = await prisma.room.findUnique({
            where: { id: body.roomId },
            include: {
                bookings: {
                    where: {
                        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
                        checkInDate: { lte: new Date(body.checkOutDate) },
                        checkOutDate: { gte: new Date(body.checkInDate) },
                    },
                },
            },
        });

        if (!room) {
            return c.json({ message: 'Room not found' }, 404);
        }

        const currentOccupancy = room.bookings.reduce(
            (sum, booking) => sum + booking.numberOfGuests,
            0
        );

        if (currentOccupancy + body.numberOfGuests > room.capacity) {
            return c.json({ message: 'Room capacity exceeded' }, 400);
        }

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                roomId: body.roomId,
                bookedById: userId,
                guestName: body.guestName,
                identityCard: body.identityCard,
                identityType: body.identityType,
                numberOfGuests: body.numberOfGuests,
                checkInDate: new Date(body.checkInDate),
                checkOutDate: new Date(body.checkOutDate),
                totalAmount:
                    room.pricePerNight *
                    calculateNights(
                        new Date(body.checkInDate),
                        new Date(body.checkOutDate)
                    ),
                contactNumber: body.contactNumber,
                contactEmail: body.contactEmail,
                specialRequests: body.specialRequests,
            },
        });

        // Update room's remaining capacity
        const updatedRoom = await prisma.room.update({
            where: { id: body.roomId },
            data: {
                capacity: room.capacity - (currentOccupancy + body.numberOfGuests),
            },
        });

        return c.json({ booking, updatedRoom });
    } catch (error) {
        console.error(error);
        return c.json(
            {
                message: 'Error creating booking',
            },
            500
        );
    }
});


// Search bookings
bookingRouter.get('/search', async (c) => {
    try {
        const query = c.req.query('q');
const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());
        const bookings = await prisma.booking.findMany({
            where: {
                guestName: {
                    contains: query,
                    mode: 'insensitive',
                },
            },
            include: {
                room: true,
                bookedBy: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        return c.json({ bookings });
    } catch (error) {
        console.error(error);
        return c.json(
            {
                message: 'Error searching bookings',
            },
            500
        );
    }
});

// Get single booking
bookingRouter.get('/:id', async (c) => {
    try {
        const { id } = c.req.param();

        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        const booking = await prisma.booking.findUnique({
            where: { id },
            include: {
                room: true,
                bookedBy: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        if (!booking) {
            return c.json({ message: 'Booking not found' }, 404);
        }

        return c.json({ booking });
    } catch (error) {
        console.error(error);
        return c.json(
            {
                message: 'Error fetching booking',
            },
            500
        );
    }
});

// Export the router



