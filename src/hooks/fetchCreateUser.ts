import {User} from "@auth0/auth0-react";
import axios from "axios";
import {axiosInstance} from "./axios.config.ts";


export const fetchCreateUser = async (email: string): Promise<User> => {

    try {
        const response = await axiosInstance.post<User>("/user/", {email})

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
                console.log("User already exists.");
                return error.response.data;
            }
            throw new Error(error.response?.data?.message || error.message);
        } else {
            throw new Error("An unexpected error occurred");
        }
    }

}