import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { userRouter } from './routes/user';
import { roomRouter } from './routes/room';
import { bookingRouter } from './routes/booking';

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

// Apply the CORS middleware with access for all origins
app.use(
  '*',
  cors({
    origin: '*', // Allow all origins
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

app.get('/', async () => {
  return new Response('ll');
});
app.route('/api/v1/user', userRouter);
app.route('/api/v1/rooms', roomRouter);
app.route('/api/v1/bookings', bookingRouter);

export default app;
