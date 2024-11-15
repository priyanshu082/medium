import { BlogInterface } from "../hooks"
import { Appbar } from "./Appbar"
import { Avatar } from "./BlogCard"

export const FullBlog = ({ blog }: { blog: BlogInterface }) => {
    return (
        <div>
            <Appbar />
            <div className="flex justify-center">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-6 lg:px-10 w-full pt-12 max-w-screen-xl">
                    {/* Main Content */}
                    <div className="col-span-1 lg:col-span-8 ">
                        <div className="text-3xl md:text-3xl lg:text-4xl font-extrabold break-words">
                            {blog.title}
                        </div>
                        <div className="text-slate-500 pt-2">
                            Posted on 2nd December 2023
                        </div>
                        <div className="pt-4 text-lg break-words whitespace-pre-wrap">
                            {blog.content}
                        </div>
                    </div>

                    {/* Author Details */}
                    <div className="col-span-1 lg:col-span-4 flex flex-col">
                        <div className="text-slate-700 text-xl">
                            Author
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center w-full mt-2 space-y-4 md:space-y-0">
                            <div className="flex justify-center md:justify-start pr-4">
                                <Avatar size="big" name={blog.author.username || "Anonymous"} />
                            </div>
                            <div className="text-center md:text-left">
                                <div className="text-xl font-bold">
                                    {blog.author.username || "Anonymous"}
                                </div>
                                <div className="pt-1 text-slate-500">
                                    Random catch phrase about the author's ability to grab the user's attention
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
