import {axiosInstance} from "./axios.config.ts";
import {toast} from "react-toastify";
import axios from "axios";
import {Snippet} from "../utils/snippet.ts";

const fetchShareSnippet = async (snippetId: string, userEmail: string | undefined, ownerEmail: string | undefined, role: string | undefined = "Editor" ): Promise<Snippet> => {
    try {
        const response = await axiosInstance.post(
            `api/snippets/share/${snippetId}`,
            { fromEmail: ownerEmail, toEmail: userEmail, role: role }
        );
        toast.success('Snippet shared successfully!');
        return response.data;
    } catch (error) {

        if (axios.isAxiosError(error)) {
            if (error.response?.status === 403) {
                toast.error("You do not have permission to share this snippet.");
                return error.response.data;
            }
            throw new Error(error.response?.data?.message || error.message);
        } else {
            throw new Error("An unexpected error occurred");
        }
    }
}

export {fetchShareSnippet};
