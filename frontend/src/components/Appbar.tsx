import { Avatar } from "./BlogCard"
import { Link, useNavigate } from "react-router-dom"

export const Appbar = () => {
    const navigate = useNavigate();
    
    const handleNewPost = () => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/publish');
        } else {
            navigate('/signin');
        }
    }
    
    const handleProfile = () => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/profile'); // Assuming you have a profile route
        } else {
            navigate('/signin');
        }
    }
    
    return (
        <div className="border-b flex justify-between px-10 py-4">
            <Link to={'/'} className="flex flex-col justify-center cursor-pointer">
                Medium
            </Link>
            <div className="flex items-center">
                <button
                    onClick={handleNewPost}
                    type="button"
                    className="mr-4 text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2"
                >
                    New
                </button>
                
                <div onClick={handleProfile} className="cursor-pointer">
                    <Avatar size={"big"} name="harkirat" />
                </div>
            </div>
        </div>
    )
}