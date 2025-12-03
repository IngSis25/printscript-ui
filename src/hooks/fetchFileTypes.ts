import axios from "axios";
import {FileType} from "../types/FileType";
import {axiosInstance} from "./axios.config.ts";

interface ApiResponseItem {
    name: string;
    extension: string;
    version: string;
    id: string;
}

export const fetchFileTypes = async (): Promise<FileType[]> => {
    try {
        const response = await axiosInstance.get("api/languages/all")

        if (response.data === undefined) {
            return [];
        }

        return response.data.map((item: ApiResponseItem) => ({
            language: item.name,
            extension: item.extension,
            version: item.version,
            id: item.id as string
        })) as FileType[];

    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                return [];
            } else {
                throw new Error(error.response?.data?.message || error.message);
            }
        } else {
            throw new Error("An unexpected error occurred");
        }
    }
};

