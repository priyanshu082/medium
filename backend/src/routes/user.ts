import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'


//typescript saw errror in env files so there is different way of doing env to string
// const app = new Hono()
export const userRouter=new Hono<{
 Bindings:{
  //importing from wrangler.toml not .env
  DATABASE_URL:string//we have intialized here that it should be string
  JWT_SECRET:string; 
 }
}>()



userRouter.post('/signup',async (c) => {
        const body=await c.req.json();
          const prisma = new PrismaClient({
          datasourceUrl: c.env.DATABASE_URL,
          }).$extends(withAccelerate())
          
          try {
            const user= await prisma.user.create({
              data:{
                email:body.email,
                password:body.password,
                username:body.username
              }
            })
            // console.log(user)
            const jwt=await sign({id:user.id},c.env.JWT_SECRET)

            return c.text(jwt)
          } catch (error) {
            console.log(error)
            c.status(411)
            return c.text("Invalid")
          }
  })


userRouter.post('/signin',async (c) => {
  const body=await c.req.json();
  const prisma = new PrismaClient({
  datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  try {
    const user= await prisma.user.findFirst({
      where:{
        email:body.email,
        password:body.password
      }
    })

    if(!user){
      c.status(403)
      return c.json({
        message:"Incorrect Credentials"
      })
    }

    const jwt=await sign({id:user.id},c.env.JWT_SECRET)
    return c.text(jwt)

  } catch (error) {
    console.log(error)
    c.status(411)
    return c.text("Invalid")
  }
})