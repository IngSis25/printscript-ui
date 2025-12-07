import axios from "axios";
import {Snippet} from "../utils/snippet.ts";
import {axiosInstance} from "./axios.config.ts";

const fetchSnippetById = async (id: string): Promise<Snippet | undefined> => {
    console.log("fetchSnippetById called with id:", id);
    try {
        const url = `api/snippets/${id}`;
        console.log("Making request to:", url);
        const response = await axiosInstance.get(url);
        console.log("Response received:", response.data);
        return response.data as Snippet;
    } catch (error) {
        console.error("Error in fetchSnippetById:", error);
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || error.message);
        } else {
            throw new Error("An unexpected error occurred");
        }
    }
}

export {fetchSnippetById};