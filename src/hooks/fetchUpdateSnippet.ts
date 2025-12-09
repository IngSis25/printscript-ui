import {SnippetWithErr} from "../utils/snippet.ts";
import {axiosInstance} from "./axios.config.ts";
import axios from "axios";
import {toast} from "react-toastify";


const fetchUpdateSnippet = async (id: string, content: string): Promise<SnippetWithErr> => {
    try {
        const response = await axiosInstance.put(`api/snippets/${id}`, {content})  // axiosInstance already has /api prefix

        const result = {
            id: response.data.id,
            name: response.data.name,
            content: response.data.content,
            language: response.data.language,
            extension: response.data.extension,
            status: response.data.status,
            author: response.data.owner,
            errors: response.data.errors
        } as SnippetWithErr

        const errors: string[] = response.data.errors;

        if (errors && errors.length > 0) {
            toast.error("The snippet has compilation errors");
        }

        return result
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Manejar específicamente el error 403 (Forbidden) para permisos de Viewer
            if (error.response?.status === 403) {
                const errorMessage = error.response?.headers?.["error-message"] 
                    || error.response?.data?.message 
                    || "No tenés permisos para editar este snippet. Solo tenés permisos de lectura (Viewer).";
                throw new Error(errorMessage);
            }
            throw new Error(error.response?.data?.message || error.message);
        } else {
            throw new Error("An unexpected error occurred");
        }
    }
}

export {fetchUpdateSnippet};