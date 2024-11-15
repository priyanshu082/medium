import axios from "axios"
import { useEffect, useState } from "react"
import { BACKEND_URL } from "../config"

export interface BlogInterface{
    title:string,
    content:string,
    id:string,
    author: {
        username: string
    }
}

export const useBlog=({id}:{id:string})=>{
 const [loading,setLoading]=useState<Boolean>(true)
 const [blog ,setBlog]=useState<BlogInterface>()
 console.log(id)

 useEffect(()=>{
    axios.get(`${BACKEND_URL}/api/v1/blog/${id}`,{
        headers:{
            Authorization:localStorage.getItem("token")
        }
    })
    .then(res=>{
        console.log(res)
        setBlog(res.data.blog)
        setLoading(false)
    })
 },[id])


 return {
    loading,
    blog
 }
}

export const useBlogs=()=>{
 const [loading,setLoading]=useState<Boolean>(true)
 const [blogs ,setBlogs]=useState<BlogInterface[]>([])

 useEffect(()=>{
    axios.get(`${BACKEND_URL}/api/v1/blog/blogs/all`,{
        headers:{
            Authorization:localStorage.getItem("token")
        }
    })
    .then(res=>{
        // console.log(res.data)
        setBlogs(res.data.blogs)
        setLoading(false)
    })
 },[])


 return {
    loading,
    blogs
 }
}

