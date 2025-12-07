import axios from "axios";
import {PaginatedSnippets} from "../utils/snippet.ts";
import {axiosInstance} from "./axios.config.ts";

const fetchUserSnippets = async (userId: string, page: number, pageSize: number, snippetName?: string): Promise<PaginatedSnippets> => {
    try {
        const params = new URLSearchParams({
            userId: userId,
            page: page.toString(),
            pageSize: pageSize.toString(),
        });
        
        if (snippetName) {
            params.append('snippetName', snippetName);
        }
        
        const url = `api/snippets/user?${params.toString()}`;
        const response = await axiosInstance.get(url);
        return response.data as PaginatedSnippets;
    } catch (error) {
        console.error("Error in fetchUserSnippets:", error);
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || error.message);
        } else {
            throw new Error("An unexpected error occurred");
        }
    }
}

export {fetchUserSnippets};

