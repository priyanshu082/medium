import z from "zod"

export const signupInput=z.object({
    username:z.string(),
    email:z.string().email(),
    password:z.string().min(8),
})

export const signinInput =z.object({
    email:z.string(),
    password:z.string().min(8)
})

export const createBlogInput =z.object({
    title:z.string(),
    content:z.string()
})

export const updateBlogInput =z.object({
    title:z.string(),
    content:z.string(),
    id:z.string()
})


//type interfernce in zod
//for frontend
export type SigninInput=z.infer<typeof signinInput>
export type CreateBLogInput=z.infer<typeof createBlogInput>
export type SignupInput= z.infer<typeof signupInput>
export type UpdateBlogInput=z.infer<typeof updateBlogInput>

