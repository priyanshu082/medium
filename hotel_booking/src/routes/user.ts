import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'
import { authMiddleware } from '../authmiddleware'

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    },
    Variables: {
        userId: string
    }
}>();

// Public routes
userRouter.post('/signup', async (c) => {
    try {
        const body = await c.req.json();
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        const user = await prisma.user.create({
            data: {
                email: body.email,
                password: body.password, // Note: Add password hashing in production
                username: body.username,
                name: body.name,
                role: body.role || 'ADMIN'
            }
        });

        const token = await sign({ id: user.id }, c.env.JWT_SECRET);

        return c.json({
            token,
            id: user.id,
            email: user.email
        });
    } catch (error) {
        console.error(error);
        return c.json({
            message: "Error creating user"
        }, 500);
    }
});

userRouter.post('/signin', async (c) => {
    try {
        const body = await c.req.json();
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        const user = await prisma.user.findUnique({
            where: {
                email: body.email
            }
        });

        if (!user || user.password !== body.password) { // Add proper password comparison in production
            return c.json({
                message: "Invalid credentials"
            }, 401);
        }

        const token = await sign({ id: user.id }, c.env.JWT_SECRET);

        return c.json({
            token,
            id: user.id,
            email: user.email
        });
    } catch (error) {
        console.error(error);
        return c.json({
            message: "Error during signin"
        }, 500);
    }
});

// Protected routes
userRouter.use('/*', authMiddleware);

userRouter.get('/profile', async (c) => {
    try {
        const userId = c.get('userId');
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                role: true,
                bookings: {
                    select: {
                        id: true,
                        guestName: true,
                        checkInDate: true,
                        checkOutDate: true,
                        room: true,
                        status: true
                    }
                }
            }
        });

        return c.json({ user });
    } catch (error) {
        console.error(error);
        return c.json({
            message: "Error fetching profile"
        }, 500);
    }
});