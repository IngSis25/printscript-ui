import axios from "axios";
import { axiosInstance } from "./axios.config.ts";

type DownloadSnippetResponse = {
    name: string;
    content: string;
    language: string;
    version: string;
};

const fetchDownloadSnippet = async (snippetId: string, includeMetadata: boolean): Promise<void> => {
    try {
        try {
            const checkOwnerResponse = await axiosInstance.post(
                `api/snippets/${snippetId}/check-owner`,
                {}
            );

            const ownerMessage = checkOwnerResponse.data;
            if (
                typeof ownerMessage !== "string" ||
                !ownerMessage.includes("User is the owner")
            ) {
                throw new Error(
                    "No tenés permisos para descargar este snippet. Solo el dueño puede descargarlo."
                );
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                const errorMessage =
                    error.response.data ||
                    "No tenés permisos para descargar este snippet. Solo el dueño puede descargarlo.";
                throw new Error(
                    typeof errorMessage === "string"
                        ? errorMessage
                        : "No tenés permisos para descargar este snippet. Solo el dueño puede descargarlo."
                );
            }
            throw error;
        }

        // Si llegamos hasta acá, el usuario es el dueño y puede descargar el snippet
        const response = await axiosInstance.get<DownloadSnippetResponse>(
            `api/snippets/${snippetId}/download`
        );

        const data = response.data;

        const extension =
            data.language?.toLowerCase() === "printscript" ? ".ps" : ".txt";

        // Crear el nombre del archivo
        const fileName = data.name.endsWith(extension)
            ? data.name
            : `${data.name}${extension}`;

        // Crear el contenido del archivo
        let fileContent = data.content;

        if (includeMetadata) {
            const metadata = [
                `// Name: ${data.name}`,
                `// Language: ${data.language}`,
                `// Version: ${data.version}`,
                `//`,
            ].join("\n");
            fileContent = `${metadata}\n${fileContent}`;
        }

        const blob = new Blob([fileContent], { type: "text/plain" });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;

        // Agregar el enlace al DOM, hacer click y removerlo
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Liberar la URL del objeto
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error downloading snippet:", error);

        if (error instanceof Error && error.message.includes("No tenés permisos")) {
            throw error;
        }

        if (axios.isAxiosError(error)) {
            if (error.response?.status === 400 && error.response.data) {
                const errorMessage =
                    typeof error.response.data === "string"
                        ? error.response.data
                        : (error.response.data as any)?.message || error.message;
                throw new Error(errorMessage);
            }
            throw new Error(error.response?.data?.message || error.message);
        } else {
            throw new Error("An unexpected error occurred");
        }
    }
};

export { fetchDownloadSnippet };
