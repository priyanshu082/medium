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
                identityType: body.identityType as "PASSPORT" | "NATIONAL_ID" | "DRIVER_LICENSE" | "AADHAR_CARD",
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

// Get All Bookings Route
bookingRouter.get('/allBookings', async (c) => {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        const bookings = await prisma.booking.findMany({
            include: {
                room: true,
                bookedBy: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return c.json({
            success: true,
            bookings
        });

    } catch (error: any) {
        console.error(error);
        return c.json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        }, 500);
    }
});


// Cancel Booking Route
bookingRouter.put('/cancel/:id', async (c) => {
    try {
        const { id } = c.req.param();
        const userId = c.get('userId');
        
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());
        
        // First check if booking exists and is in a cancellable state
        const existingBooking = await prisma.booking.findUnique({
            where: { id },
            include: {
                bookedBy: true
            }
        });
        
        if (!existingBooking) {
            return c.json({
                success: false,
                message: 'Booking not found'
            }, 404);
        }


        
        // Only allow cancellation of PENDING or CONFIRMED bookings
        if (existingBooking.status !== 'PENDING' && existingBooking.status !== 'CONFIRMED') {
            return c.json({
                success: false,
                message: `Cannot cancel booking with status: ${existingBooking.status}`
            }, 400);
        }
        
        // Update booking status to CANCELLED
        const cancelledBooking = await prisma.booking.update({
            where: { id },
            data: {
                status: 'CANCELLED',
            },
            include: {
                room: true,
                bookedBy: true
            }
        });
        
        return c.json({
            success: true,
            message: 'Booking cancelled successfully',
            booking: cancelledBooking
        });
        
    } catch (error: any) {
        console.error(error);
        return c.json({
            success: false,
            message: 'Error cancelling booking',
            error: error.message
        }, 500);
    }
});

// Checkout Route
bookingRouter.post('/checkout/:id', async (c) => {
    try {
        const { id } = c.req.param();
        const userId = c.get('userId');
        
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());
        
        // First check if booking exists and is in CHECKED_IN status
        const existingBooking = await prisma.booking.findUnique({
            where: { id },
            include: {
                bookedBy: true
            }
        });
        
        if (!existingBooking) {
            return c.json({
                success: false,
                message: 'Booking not found'
            }, 404);
        }


        
        // Only allow checkout for CHECKED_IN bookings
        if (existingBooking.status !== 'CHECKED_IN') {
            return c.json({
                success: false,
                message: `Cannot checkout booking with status: ${existingBooking.status}`
            }, 400);
        }
        
        // Update booking status to CHECKED_OUT
        const checkedOutBooking = await prisma.booking.update({
            where: { id },
            data: {
                status: 'CHECKED_OUT',
                checkOutDate: new Date() // Add actual checkout time
            },
            include: {
                room: true,
                bookedBy: true
            }
        });
        
        return c.json({
            success: true,
            message: 'Checkout completed successfully',
            booking: checkedOutBooking
        });
        
    } catch (error: any) {
        console.error(error);
        return c.json({
            success: false,
            message: 'Error during checkout',
            error: error.message
        }, 500);
    }
});


// Check in to a booking
bookingRouter.put('/checkin/:id', async (c) => {
    try {
        const { id } = c.req.param();
        const userId = c.get('userId');

        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        // Find the booking
        const existingBooking = await prisma.booking.findUnique({
            where: { id },
            include: {
                bookedBy: true
            }
        });

        if (!existingBooking) {
            return c.json({
                success: false,
                message: 'Booking not found'
            }, 404);
        }

        // Verify user owns this booking
        // No need to verify booking ownership

        // Only allow check in for CONFIRMED bookings
        if (existingBooking.status !== 'CONFIRMED') {
            return c.json({
                success: false,
                message: `Cannot check in booking with status: ${existingBooking.status}`
            }, 400);
        }

        // Update booking status to CHECKED_IN
        const checkedInBooking = await prisma.booking.update({
            where: { id },
            data: {
                status: 'CHECKED_IN',
                checkInDate: new Date() // Add actual check in time
            },
            include: {
                room: true,
                bookedBy: true
            }
        });

        return c.json({
            success: true,
            message: 'Check in completed successfully',
            booking: checkedInBooking
        });

    } catch (error: any) {
        console.error(error);
        return c.json({
            success: false,
            message: 'Error during check in',
            error: error.message
        }, 500);
    }
});




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


