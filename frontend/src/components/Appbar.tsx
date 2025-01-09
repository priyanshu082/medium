import { useUser } from "../hooks";
// import { Avatar } from "./BlogCard"
import { Link, useNavigate } from "react-router-dom"

export const Appbar = () => {
    const navigate = useNavigate();

    // const {user}=useUser()
    
    // const handleNewPost = () => {
    //     const token = localStorage.getItem('token');
    //     if (token) {
    //         navigate('/publish');
    //     } else {
    //         navigate('/signin');
    //     }
    // }
    
    // const handleProfile = () => {
    //     const token = localStorage.getItem('token');
    //     if (token) {
    //         navigate('/profile'); // Assuming you have a profile route
    //     } else {
    //         navigate('/signin');
    //     }
    // }
    
    return (
        <div className="border-b flex justify-between px-10 py-4">
            <Link to={'/'} className="flex items-center gap-2 text-2xl cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                    <span className="text-white font-bold">क</span>
                </div>
                <span className="font-semibold text-orange-600">कुम्भ</span>
            </Link>
            <button
                onClick={() => {
                    localStorage.removeItem('token');
                    navigate('/signin');
                }}
                type="button"
                className="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2"
            >
                Logout
            </button>
        </div>
    )
}