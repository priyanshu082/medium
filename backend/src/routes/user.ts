import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import {signupInput} from "@priyanshu082/common"
import {sign,verify} from "hono/jwt"
import { authMiddleware } from '../authmiddleware'


//typescript saw errror in env files so there is different way of doing env to string
// const app = new Hono()
export const userRouter=new Hono<{
 Bindings:{
  //importing from wrangler.toml not .env
  DATABASE_URL:string//we have intialized here that it should be string
  JWT_SECRET:string; 
 }
 Variables: {
  userId: string;
}
}>()



userRouter.post('/signup',async (c) => {
        const body=await c.req.json();
        const {success}= signupInput.safeParse(body)

        if(!success){
            c.status(411)
            return c.json({
                message:"Inputs are incorrect"
            })
        }
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



// Apply the middleware
userRouter.use("/user", authMiddleware);

userRouter.get('/user', async (c) => {
  try {
    // Get the userId set by the auth middleware
    const userId = c.get("userId");

    if (!userId) {
      c.status(401);
      return c.json({ message: "Unauthorized. User ID not found." });
    }

    // Initialize Prisma client
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    // Fetch user data (excluding sensitive information like password)
    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId), // Ensure userId is a number
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        blogs: {
          select: {
            id: true,
            title: true,
            content: true,
            published: true,
          },
        },
      },
    });

    if (!user) {
      c.status(404);
      return c.json({ message: "User not found" });
    }

    return c.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    c.status(500);
    return c.json({ message: "Server error while fetching user details" });
  }
});