import { axiosInstance } from "./axios.config.ts";
import axios from "axios";
import { PaginatedUsers } from "../utils/users.ts";

type UserResponse = {
    id: string;
    email: string;
    // si el backend no manda auth0Id, sacalo o hacelo opcional:
    // auth0Id?: string;
};

const mapToUser = (user: UserResponse) => {
    return {
        id: user.id,
        name: user.email,
    };
};

const fetchUserFriends = async (
    search: string,
    currentEmail: string
): Promise<PaginatedUsers> => {
    try {
        const response = await axiosInstance.get("/api/auth0/users", {
            params: { search },
        });


        const filteredUsers = response.data.filter(
            (user: UserResponse) => user.email !== currentEmail
        );

        return {
            page: 1,
            page_size: filteredUsers.length,
            count: filteredUsers.length,
            users: filteredUsers.map(mapToUser),
        };
    } catch (error) {
        console.error("Error fetching user friends:", error);
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || error.message);
        } else {
            throw new Error("An unexpected error occurred");
        }
    }
};

export { fetchUserFriends };
