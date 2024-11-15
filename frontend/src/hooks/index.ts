import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config";

export interface BlogInterface {
  title: string;
  content: string;
  id: string;
  author: {
    username: string;
  };
  published?:boolean
}

export interface UserInterface {
  id: string;
  email: string;
  username: string;
  name?: string;
  blogs: BlogInterface[];
}

// Hook for fetching a single blog
export const useBlog = ({ id }: { id: string }) => {
  const [loading, setLoading] = useState<Boolean>(true);
  const [blog, setBlog] = useState<BlogInterface>();

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/v1/blog/${id}`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((res) => {
        setBlog(res.data.blog);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching blog:", err);
        setLoading(false);
      });
  }, [id]);

  return {
    loading,
    blog,
  };
};

// Hook for fetching all blogs
export const useBlogs = () => {
  const [loading, setLoading] = useState<Boolean>(true);
  const [blogs, setBlogs] = useState<BlogInterface[]>([]);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/v1/blog/blogs/all`, {
        headers: {
          Authorization:localStorage.getItem("token"),
        },
      })
      .then((res) => {
        setBlogs(res.data.blogs);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching blogs:", err);
        setLoading(false);
      });
  }, []);

  return {
    loading,
    blogs,
  };
};

// Hook for fetching user data
export const useUser = () => {
  const [loading, setLoading] = useState<Boolean>(true);
  const [user, setUser] = useState<UserInterface | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/user`, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        console.log(response.data)
        setUser(response.data); // Assuming the API returns the user object directly
      } catch (err: any) {
        console.error("Error fetching user data:", err);
        setError(err.response?.data?.message || "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return {
    loading,
    user,
    error,
  };
};
