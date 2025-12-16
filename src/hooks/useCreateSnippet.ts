import {SnippetWithErr} from "../utils/snippet.ts";
import {axiosInstance} from "./axios.config.ts";
import {toast} from "react-toastify";
import axios from "axios";


export const useCreateSnippet = async (
    name: string,
    content: string,
    language: string,
    extension: string,
    version: string,
    token: string,
    ownerEmail?: string,
    languageId?: string
): Promise<SnippetWithErr> => {
    try {
        const requestBody: any = {
            name,
            content,
            language,
            extension,
            version,
            owner: ownerEmail
        };
        
        // Si tenemos el languageId, agregarlo al request para evitar ambigüedad
        if (languageId) {
            requestBody.languageId = languageId;
        }
        
        const response = await axiosInstance.post("/api/snippets", requestBody, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const result = {
            id: response.data.id,
            name: response.data.name,
            content: response.data.content,
            language: response.data.language,
            extension: response.data.extension,
            status: response.data.status,
            author: response.data.owner,
            errors: response.data.errors,
        } as SnippetWithErr

        const errors: string[] = response.data.errors;

        if (errors && errors.length > 0) {
            toast.error("The snippet has compilation errors");
        }

        return result
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || error.message);
        } else {
            throw new Error("An unexpected error occurred");
        }
    }
};