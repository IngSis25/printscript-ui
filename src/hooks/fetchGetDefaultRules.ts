import {axiosInstance} from "./axios.config.ts";

export const fetchGetDefaultRules = async (): Promise<void> => {
    try {
        await axiosInstance.get("/snippets/rules/default");
    } catch (error) {
        console.error("Failed to set default rules:", error);
        throw error;
    }
};