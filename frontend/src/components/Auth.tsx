import { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SignupInput } from "@priyanshu082/common";
import axios from "axios";
import { BACKEND_URL } from "../config";
import SimpleAlert from "./Alert";
import { alertTypeEnum } from "../config";

export const Auth = ({ type }: { type: "signup" | "signin" }) => {
    const navigate = useNavigate();
    const [postInputs, setPostInputs] = useState<SignupInput>({
        email: "",
        username: "",
        password: ""
    });

   
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertType,setAlertType]=useState<alertTypeEnum>()

    async function sendRequest() {
        try {
            const response = await axios.post(
                `${BACKEND_URL}/api/v1/user/${type === "signup" ? "signup" : "signin"}`,
                postInputs
            );
    
            // Get the user ID from the response
            const user = response.data.user;
    
            // Store user ID in local storage
            localStorage.setItem("id", user.id);
            localStorage.setItem("name", user.name);
            localStorage.setItem("role", user.role);
    
            // Show success message and redirect
            setAlertMessage("Login Successful");
            setAlertType(alertTypeEnum.success);
            
            setTimeout(() => {
                navigate("/");
            }, 1000);
            
        } catch (e:any) {
            // Handle error
            setAlertMessage(e.response?.data?.message || "An error occurred");
            setAlertType(alertTypeEnum.error);
            console.error(e.message);
        }
    }

    // async function sendRequest() {
    //     try {
    //         const response = await axios.post(
    //             `${BACKEND_URL}/api/v1/user/${type === "signup" ? "signup" : "signin"}`,
    //             postInputs
    //         );
    //         const id = response.data.id;
    //         localStorage.setItem("id", id);
    //         setAlertMessage("Login Successful");
    //         setAlertType(alertTypeEnum.success)
    //         setTimeout(() => {
    //             navigate("/");
    //         }, 2000);
    //     } catch (e) {
    //         //@ts-ignore
    //         setAlertMessage(e.message);
    //         setAlertType(alertTypeEnum.error)
    //         //@ts-ignore
    //         console.log(e.message)
    //     }
    // }
    

    return (
        <div className="h-screen flex justify-center flex-col">
            <div className="flex justify-center">
                <div>
                    {alertMessage && <SimpleAlert message={alertMessage} type={alertType} />}
                    <div className="px-10">
                        <div className="text-3xl font-extrabold">
                            {type === "signup" ? "Create an account" : "Sign in"}
                        </div>
                        <div className="text-slate-500">
                            {type === "signin"
                                ? "Don't have an account?"
                                : "Already have an account?"}
                            <Link className="pl-2 underline" to={type === "signin" ? "/signup" : "/signin"}>
                                {type === "signin" ? "Sign up" : "Sign in"}
                            </Link>
                        </div>
                    </div>
                    <div className="pt-8">
                        {type === "signup" ? (
                            <LabelledInput
                                label="Username"
                                placeholder="Priyanshu Singh..."
                                onChange={(e) => {
                                    setPostInputs({
                                        ...postInputs,
                                        username: e.target.value,
                                    });
                                }}
                            />
                        ) : null}
                        <LabelledInput
                            label="Email"
                            placeholder="priyanshu216@gmail.com"
                            onChange={(e) => {
                                setPostInputs({
                                    ...postInputs,
                                    email: e.target.value,
                                });
                            }}
                        />
                        <LabelledInput
                            label="Password"
                            type={"password"}
                            placeholder="123456"
                            onChange={(e) => {
                                setPostInputs({
                                    ...postInputs,
                                    password: e.target.value,
                                });
                            }}
                        />
                        <button
                            onClick={sendRequest}
                            type="button"
                            className="mt-8 w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                        >
                            {type === "signup" ? "Sign up" : "Sign in"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface LabelledInputType {
    label: string;
    placeholder: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    type?: string;
}

function LabelledInput({ label, placeholder, onChange, type }: LabelledInputType) {
    return (
        <div>
            <label className="block mb-2 text-sm text-black font-semibold pt-4">{label}</label>
            <input
                onChange={onChange}
                type={type || "text"}
                id="first_name"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder={placeholder}
                required
            />
        </div>
    );
}
