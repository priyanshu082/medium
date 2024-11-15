import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { authMiddleware } from '../authmiddleware'



//typescript saw errror in env files so there is different way of doing env to string
// const app = new Hono()
export const blogRouter = new Hono<{
    Bindings: {
        //importing from wrangler.toml not .env
        DATABASE_URL: string//we have intialized here that it should be string
        JWT_SECRET: string;
    },
    Variables:{
        userId:string
    }
}>()

//all these routes need to verify
blogRouter.use("/*", authMiddleware);


blogRouter.post('/', async (c) => {
    try {
        const body = await c.req.json()
        const userId=c.get("userId")
        // console.log("UserId" , userId )
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate())

        const blog = await prisma.blog.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: Number(userId),
            }
        })

        return c.json({
            id: blog.id,
            title: blog.title
        })
    } catch (error) {
        console.log(error)
        return c.json({
            message: "Error"
        })
    }

})

blogRouter.put('/', async (c) => {
    try {
        const body = await c.req.json()

        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate())

        const blog = await prisma.blog.update({
            where: {
                id: body.id
            },
            data: {
                title: body.title,
                content: body.content,
            }
        })

        return c.json({
            id: blog.id,
            title: blog.title
        })
    } catch (error) {
        console.log(error)
        return c.json({
            message: "Error"
        })
    }

})




blogRouter.get('/:id', async (c) => {
    try {
        const {id} = c.req.param();
        // console.log("ID___________________=====",id)
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate())

        const blog = await prisma.blog.findFirst({
            where: {
                id: id
            },
            select:{
                id: true,
                title: true,
                content: true,
                authorId:true,
                author: {
                    select:{
                        username:true,
                        
                    }
                }
            }
        })

        return c.json({
            blog
        })

    } catch (error) {
        // console.log(error)c
        return c.json({
            message: "Error while fetching blog"
        })
    }

})

//pagination should be added here
blogRouter.get("/blogs/all", async (c) => {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate())
        const blogs = await prisma.blog.findMany({
            select:{
                id: true,
                title: true,
                content: true,
                author: {
                    select:{
                        username:true
                    }
                }
            }
        })
        return c.json({
            blogs
        })
    } catch (error) {
        console.log(error)
        return c.json({
            message: "Error"
        })
    }
})



// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6M30.56WFVR767L8Y7mcp2DXmlYKHgAnjgaOWZROHP9HhhTk