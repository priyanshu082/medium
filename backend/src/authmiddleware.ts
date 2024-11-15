import { Context } from 'hono';
import { verify } from 'hono/jwt';

export const authMiddleware = async (c: Context, next: Function) => {
    try {
        const header = c.req.header("authorization") || "";
        const user = await verify(header, c.env.JWT_SECRET);
        if (user) {
            // @ts-ignore
            c.set("userId", user.id);
            await next();
        }
    } catch (error) {
        return c.json({
            message: "You are not logged in"
        });
    }
};
