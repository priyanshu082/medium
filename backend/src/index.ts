import { Hono } from 'hono'
import { userRouter } from './routes/user'
import { blogRouter } from './routes/blog'


//typescript saw errror in env files so there is different way of doing env to string
// const app = new Hono()
const app=new Hono<{
 Bindings:{
  //importing from wrangler.toml not .env
  DATABASE_URL:string//we have intialized here that it should be string
  JWT_SECRET:string; 
 }
}>()


app.route("/api/v1/user/", userRouter)
app.route("/api/v1/blog/", blogRouter)


export default app