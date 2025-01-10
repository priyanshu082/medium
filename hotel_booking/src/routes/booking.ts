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
bookingRouter.post('/bookingRoom', async (c) => {
    try {
        const body = await c.req.json();
 const userId = c.get('userId');
        // Initialize Prisma client
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        // Check if the room exists and fetch bookings
        const room = await prisma.room.findUnique({
            where: { id: body.roomId },
            include: {
                bookings: {
                    where: {
                        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
                        OR: [
                            {
                                checkInDate: { lte: new Date(body.checkOutDate) },
                                checkOutDate: { gte: new Date(body.checkInDate) },
                            },
                        ],
                    },
                },
            },
        });

        if (!room) {
            return c.json(
                {
                    message: 'Room not found',
                    roomId: body.roomId,
                },
                404
            );
        }

        // Ensure the room has sufficient capacity
        const checkIn = new Date(body.checkInDate);
        const checkOut = new Date(body.checkOutDate);
        const dateOccupancyMap = new Map();

        for (let day = new Date(checkIn); day < checkOut; day.setDate(day.getDate() + 1)) {
            const currentDate = new Date(day);

            const guestsOnThisDay = room.bookings.reduce((sum, booking) => {
                const bookingCheckIn = new Date(booking.checkInDate);
                const bookingCheckOut = new Date(booking.checkOutDate);

                if (currentDate >= bookingCheckIn && currentDate < bookingCheckOut) {
                    return sum + booking.numberOfGuests;
                }
                return sum;
            }, 0);

            const isAvailable = guestsOnThisDay + body.numberOfGuests <= room.capacity;

            if (!isAvailable) {
                return c.json(
                    {
                        message: `Room not available for date ${currentDate.toISOString().split('T')[0]}`,
                        currentOccupancy: guestsOnThisDay,
                        roomCapacity: room.capacity,
                        remainingCapacity: room.capacity - guestsOnThisDay,
                    },
                    400
                );
            }
        }

        // Create the booking
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
                status: 'CONFIRMED', // Default to CONFIRMED after successful booking
            },
            include: {
                room: true, // Include room details in the response
            },
        });

        // Fetch the updated room details, including its bookings
        const updatedRoom = await prisma.room.findUnique({
            where: { id: body.roomId },
            include: { bookings: true },
        });

        return c.json({ booking, updatedRoom });
    } catch (error) {
        console.error(error);
        return c.json(
            {
                message: 'Error creating booking',
                error: error instanceof Error ? error.message : 'Unknown error',
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
// routes/bookingRouter.js
bookingRouter.get('/details/:id', async (c) => {
    try {
        const { id } = c.req.param();
        
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());
        
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: {
                room: true,
                bookedBy: true,
            }
        });
        
        if (!booking) {
            return c.json({ 
                success: false,
                message: 'Booking not found' 
            }, 404);
        }
        
        // Calculate stay duration and other relevant information
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        const stayDuration = Math.ceil(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        const enhancedBooking = {
            ...booking,
            stayDuration,
            formattedDates: {
                checkIn: checkIn.toISOString(),
                checkOut: checkOut.toISOString(),
                created: booking.createdAt.toISOString(),
                updated: booking.updatedAt.toISOString()
            }
        };
        
        return c.json({ 
            success: true,
            booking: enhancedBooking 
        });
        
    } catch (error:any) {
        console.error(error);
        return c.json({
            success: false,
            message: 'Error fetching booking details',
            error: error.message
        }, 500);
    }
});

// Export the router
// 


