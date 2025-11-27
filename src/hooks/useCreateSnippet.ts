import {Snippet} from "../utils/snippet.ts";
import {SNIPPETS_SERVICE_URL} from "../utils/constants.ts";


export const useCreateSnippet = async (name: string, content: string, language: string, extension: string): Promise<Snippet> => {
    try {
        const response = await fetch(`${SNIPPETS_SERVICE_URL}/api/snippets`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({name, content, language, extension})
        });
        if (!response.ok) {
            console.error("Failed to create snippet");
        }

        const data = await response.json();
        return data as Snippet;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        } else {
            throw new Error("An unexpected error occurred");
        }
    }
};