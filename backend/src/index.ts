import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { userRouter } from './routes/user';
import { blogRouter } from './routes/blog';

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

// Apply the CORS middleware
app.use(
  '*',
  cors({
    origin: 'http://localhost:5173', // specify your frontend's origin
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

app.route('/api/v1/user/', userRouter);
app.route('/api/v1/blog/', blogRouter);

export default app;
