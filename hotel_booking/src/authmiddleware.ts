import { Context } from 'hono';

export const authMiddleware = async (c: Context, next: Function) => {
    try {
        // Get user ID from the headers
        const userId = c.req.header("userId");
        
        if (!userId) {
            return c.json({
                message: "User ID is required",
            }, 401);
        }

        // Set userId in the context for downstream usage
        c.set("userId", userId);

        // Proceed to the next middleware or route handler
        await next();
    } catch (error) {
        console.error(error);
        return c.json({
            message: "Authentication failed",
        }, 500);
    }
};
