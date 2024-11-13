import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { verify,decode,sign } from 'hono/jwt'


//typescript saw errror in env files so there is different way of doing env to string
// const app = new Hono()
const app=new Hono<{
 Bindings:{
  DATABASE_URL:string//we have intialized here that it should be string
 }
}>()

app.use("/api/v1/blog/*",async (c ,next )=>{
  const header= c.req.header("authorization") || ""
const token=header.split(" ")[1]
  const response =await verify(token,"secret")

  if(response.id){
    next()
  } else{
    c.status(403)
    return c.json({error:"unauhtorized"})
  }
})

    app.post('/api/v1/signup', (c) => {

          const prisma = new PrismaClient({
          datasourceUrl: c.env.DATABASE_URL,
          }).$extends(withAccelerate())
     return c.text('Hello from here!')
  })


app.post('/api/v1/signin', (c) => {
  return c.text('Hello Hono!')
})
app.post('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})
app.put('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})
app.get('/api/v1/blog/:id', (c) => {
  return c.text('Hello from yoyo here!')
})

export default app