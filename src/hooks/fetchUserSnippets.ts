import axios from "axios";
import {PaginatedSnippets, SnippetWithLintWarnings, ComplianceEnum} from "../utils/snippet.ts";
import {axiosInstance} from "./axios.config.ts";

// Función para convertir el enum del backend al enum del frontend
const mapBackendComplianceToFrontend = (backendStatus: string | undefined): ComplianceEnum => {
    if (!backendStatus) return 'pending';
    
    const normalized = backendStatus.toLowerCase().replace(/_/g, '-');
    switch (normalized) {
        case 'pending':
            return 'pending';
        case 'failed':
            return 'failed';
        case 'not-compliant':
        case 'not_compliant':
            return 'not-compliant';
        case 'success':
        case 'compliant':
            return 'compliant';
        default:
            console.warn(`Unknown compliance status: ${backendStatus}, defaulting to 'pending'`);
            return 'pending';
    }
};

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
        
        // Mapear los snippets del backend al formato del frontend
        const backendData = response.data;
        const mappedSnippets: SnippetWithLintWarnings[] = (backendData.snippets || []).map((snippet: any) => {
            // El backend devuelve 'status' como Compliance enum (PENDING, FAILED, NOT_COMPLIANT, SUCCESS)
            const compliance = mapBackendComplianceToFrontend(snippet.status);
            return {
                id: snippet.id.toString(),
                name: snippet.name,
                content: '', // No viene en la lista de snippets
                language: snippet.language,
                extension: snippet.extension,
                version: snippet.version,
                status: compliance,
                author: snippet.owner || '', // owner del backend se mapea a author
                owner: snippet.owner || '',
                compliance: compliance, // Para mostrar en la columna Conformance
                lintWarnings: snippet.lintWarnings || [],
                userRole: snippet.role, // Agregar el rol del usuario si viene (Owner, Editor, Viewer)
            };
        });
        
        return {
            page: backendData.page || page,
            page_size: backendData.page_size || pageSize,
            count: backendData.count || 0,
            snippets: mappedSnippets,
        };
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

