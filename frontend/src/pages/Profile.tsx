import { Appbar } from "../components/Appbar";
import { Spinner } from "../components/Spinner";
import { useUser } from "../hooks";
import { BlogCard } from "../components/BlogCard";


export const Profile = () => {
  const {loading,user}=useUser()

  if(loading || !user){
    return <>
    <Appbar/>
    <div className="flex justify-center items-center h-screen">
    <Spinner/>
    </div>
    </>
  }

  return (<>
     <Appbar/>
  <div className="min-h-screen bg-gray-50 p-4 md:p-8">
     
      <div className="max-w-4xl mx-auto space-y-6 ">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">{user.username}</h2>
          <div className="flex flex-col md:flex-row gap-6 md:items-center">
            {/* Avatar */}
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-3xl text-white font-bold">
                {user.username[0]}
              </span>
            </div>
            {/* User Info */}
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-800">
                {user.name}
              </h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-gray-500">@{user.username}</p>
            </div>
          </div>
        </div>

        {/* Blogs Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">My Blogs</h2>
          <div className="grid gap-4 grid-cols-1 overflow-hidden">
            {user.blogs.map((blog) => <BlogCard
              id={blog.id}
              authorName={user.username || "Anonymous"}
              title={blog.title}
              content={blog.content}
              publishedDate={"2nd Feb 2024"}
          />
            )}
          </div>
        </div>
      </div>
    </div>
  </>
    
  );
};

