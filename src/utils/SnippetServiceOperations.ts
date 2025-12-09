import {SnippetOperations} from "./snippetOperations.ts";
import {TestCaseResult} from "./queries.tsx";
import {TestCase} from "../types/TestCase.ts";
import {Rule} from "../types/Rule.ts";
import {FileType} from "../types/FileType.ts";
import {PaginatedUsers} from "./users.ts";
import {useCreateSnippet} from "../hooks/useCreateSnippet.ts";
import {CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from "./snippet.ts";
import {User} from "@auth0/auth0-react";
import {VITE_AUTH0_AUDIENCE, RUNNER_SERVICE_URL} from "./constants.ts";
import {fetchFileTypes} from "../hooks/fetchFileTypes.ts";
import {fetchSnippetById} from "../hooks/fetchSnippetById.ts";
import {fetchUserSnippets} from "../hooks/fetchUserSnippets.ts";
import {fetchUpdateSnippet} from "../hooks/fetchUpdateSnippet.ts";
import {fetchShareSnippet} from "../hooks/fetchShareSnippets.ts";
import {fetchUserFriends} from "../hooks/fetchUserFriends.ts";
import {fetchDownloadSnippet} from "../hooks/fetchDownloadSnippet.ts";
import {axiosInstance} from "../hooks/axios.config.ts";

const options = {
    authorizationParams: {
        audience: VITE_AUTH0_AUDIENCE,
    },
};

type AccessTokenFetcher = (options?: { authorizationParams?: { audience?: string } }) => Promise<string>;
type ApiErrorWithDiagnostics = Error & { status?: number; code?: string; diagnostics?: unknown[] };

export class SnippetServiceOperations implements SnippetOperations {
    private user?: User;

    constructor(
        user?: User,
        private readonly getAccessTokenSilently?: AccessTokenFetcher,
    ) {
        this.user = user
    }

    /**
     * Wrapper para fetch con token de Auth0 sin usar localStorage.
     * Construye headers y propaga errores HTTP con el cuerpo parseado si es posible.
     */
    private async fetchWithAuth(path: string, optionsReq: RequestInit = {}): Promise<Response> {
        const isFormData = optionsReq.body instanceof FormData;
        const headers: Record<string, string> = {
            ...(optionsReq.headers as Record<string, string>),
        };

        if (!isFormData && optionsReq.body !== undefined && !headers["Content-Type"]) {
            headers["Content-Type"] = "application/json";
        }

        if (this.getAccessTokenSilently) {
            try {
                const token = await this.getAccessTokenSilently({
                    authorizationParams: { audience: VITE_AUTH0_AUDIENCE },
                });
                if (token && token !== "undefined" && token !== "null") {
                    headers["Authorization"] = `Bearer ${token}`;
                }
            } catch (err) {
                console.warn("No se pudo obtener token silenciosamente", err);
            }
        }

        const url = path.startsWith("http") ? path : path;
        const res = await fetch(url, {...optionsReq, headers});

        if (!res.ok) {
            const raw = await res.text().catch(() => "");
            let parsed: unknown = undefined;
            try {
                parsed = raw ? JSON.parse(raw) : undefined;
            } catch {
                // cuerpo no era json
            }
            const err: ApiErrorWithDiagnostics = new Error(
                (parsed as { message?: string } | undefined)?.message || `HTTP ${res.status} ${url}`,
            );
            err.status = res.status;
            if ((parsed as { code?: string } | undefined)?.code) {
                err.code = (parsed as { code?: string }).code;
            }
            if (Array.isArray((parsed as { diagnostics?: unknown[] } | undefined)?.diagnostics)) {
                err.diagnostics = (parsed as { diagnostics?: unknown[] }).diagnostics;
            }
            throw err;
        }

        return res;
    }

    async listSnippetDescriptors(page: number, pageSize: number, snippetName?: string | undefined): Promise<PaginatedSnippets> {
        console.log("listSnippetDescriptors called with page:", page, "pageSize:", pageSize, "snippetName:", snippetName);
        if (!this.user?.sub) {
            console.error("listSnippetDescriptors: user.sub is not available");
            throw new Error("User not authenticated");
        }
        try {
            // Asegurar que tenemos el token antes de hacer la petición
            if (this.getAccessTokenSilently) {
                await this.getAccessTokenSilently(options);
            }
            return await fetchUserSnippets(this.user.sub, page, pageSize, snippetName);
        } catch (error) {
            console.error("Error in listSnippetDescriptors:", error);
            throw error;
        }
    }

    createSnippet = async (createSnippet: CreateSnippet): Promise<Snippet> => {
        if (!this.getAccessTokenSilently) {
            throw new Error("No se puede obtener el token de autenticación");
        }
        const token = await this.getAccessTokenSilently(options);
        const {name, content, language, extension, version} = createSnippet;
        const owner = this.user?.email
        try {
            return await useCreateSnippet(name, content, language, extension, version, token, owner);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error("Failed to create snippet: " + error.message);
            } else {
                throw new Error("Failed to create snippet: An unexpected error occurred");
            }
        }
    };

    async getSnippetById(id: string): Promise<Snippet | undefined> {
        console.log("getSnippetById called with ID:", id);
        if (!id) {
            console.error("getSnippetById: id is empty or undefined");
            return undefined;
        }
        try {
            // Asegurar que tenemos el token antes de hacer la petición
            if (this.getAccessTokenSilently) {
                await this.getAccessTokenSilently(options);
            }
            return await fetchSnippetById(id);
        } catch (error) {
            console.error("Error in getSnippetById:", error);
            throw error;
        }
    }

    updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet> {
        console.log(id, updateSnippet);
        return fetchUpdateSnippet(id, updateSnippet.content);
    }

    async getUserFriends(
        search?: string,
    ): Promise<PaginatedUsers> {
        const email = this.user?.email ?? "";
        return await fetchUserFriends(search ?? "", email);
    }

    // async getUserById(id: string): Promise<{ email?: string }> {
    //     const response = await axiosInstance.get(`/user/auth0/${id}`);
    //     if (response && response.data) {
    //         return response.data;
    //     } else {
    //         throw new Error("User not found");
    //     }
    // }

    async shareSnippet(snippetId: string, userId: string, role: string): Promise<Snippet> {
        const ownerEmail = this.user?.email;

        if (!userId) {
            throw new Error("User email not found");
        }

        return await fetchShareSnippet(snippetId, userId, ownerEmail, role);
    }


    getFormatRules(): Promise<Rule[]> {
        throw new Error("Method not implemented.");
    }

    getLintingRules(): Promise<Rule[]> {
        throw new Error("Method not implemented.");
    }

    formatSnippet(snippet: string): Promise<string> {
        console.log(snippet);
        throw new Error("Method not implemented.");
    }

    async getTestCases(snippetId: string): Promise<TestCase[]> {
        try {
            const response = await axiosInstance.get(`api/tests/snippet/${snippetId}`);
            console.log("Respuesta del backend (getTestCases):", response.data);
            // Convertir el id de Long (número) a string y asegurar que input/output sean arrays
            const mapped = response.data.map((test: any) => {
                const mappedTest = {
                    id: String(test.id),
                    name: test.name,
                    input: Array.isArray(test.input) ? test.input : [],
                    output: Array.isArray(test.output) ? test.output : [],
                };
                console.log("Test mapeado:", mappedTest);
                return mappedTest;
            });
            return mapped;
        } catch (error) {
            console.error("Error fetching test cases:", error);
            throw error;
        }
    }

    async postTestCase(testCase: Partial<TestCase>, snippetId: string): Promise<TestCase> {
        if (!snippetId) {
            throw new Error("Test case must have a snippet id");
        }
        // Asegurar que input y output sean arrays (pueden ser vacíos)
        const testCaseToSend = {
            name: testCase.name || "",
            input: Array.isArray(testCase.input) ? testCase.input : [],
            output: Array.isArray(testCase.output) ? testCase.output : [],
        };
        console.log("Enviando test case al backend:", testCaseToSend);
        const response = await axiosInstance.post(`api/tests/snippet/${snippetId}`, testCaseToSend);
        console.log("Respuesta del backend:", response.data);
        // Convertir el id de Long (número) a string
        const result = {
            id: String(response.data.id),
            name: response.data.name,
            input: Array.isArray(response.data.input) ? response.data.input : [],
            output: Array.isArray(response.data.output) ? response.data.output : [],
        };
        console.log("Test case mapeado:", result);
        return result;
    }

    async removeTestCase(id: string): Promise<string> {
        const response = await axiosInstance.delete(`api/tests/${id}`);
        return response.data;
    }


    async testSnippet(testCase: Partial<TestCase>): Promise<TestCaseResult> {
        if (!testCase.id) {
            throw new Error("Test case ID is required");
        }
        try {
            // El id viene como string del frontend, pero el backend espera Long
            const testId = testCase.id;
            const response = await axiosInstance.post<string>(`api/tests/${testId}/run`);
            const result = response.data.trim().toLowerCase();
            if (result === "success" || result === "fail") {
                return result as TestCaseResult;
            }
            // Si el backend retorna algo inesperado, asumimos que falló
            return "fail";
        } catch (error) {
            console.error("Error ejecutando test:", error);
            throw error;
        }
    }

    async deleteSnippet(id: string): Promise<string> {
        try {
            await axiosInstance.post(`/api/snippets/delete/${id}`);
            return `Snippet of id: ${id} deleted successfully`;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error("Failed to delete snippet: " + error.message);
            } else {
                throw new Error("Failed to delete snippet: An unexpected error occurred");
            }
        }
    }


    async getFileTypes(): Promise<FileType[]> {
        return fetchFileTypes();
    }

    modifyFormatRule(newRules: Rule[]): Promise<Rule[]> {
        console.log(newRules);
        throw new Error("Method not implemented.");
    }

    modifyLintingRule(newRules: Rule[]): Promise<Rule[]> {
        console.log(newRules);
        throw new Error("Method not implemented.");
    }

    async downloadSnippet(snippetId: string, includeMetadata: boolean): Promise<void> {
        return await fetchDownloadSnippet(snippetId, includeMetadata);
    }

     async runSnippet(snippetId: string, inputs?: string[]): Promise<string[]> {
        // inputs se reserva para uso futuro cuando el runner-service soporte inputs interactivos
        console.log("Running snippet:", snippetId, "with inputs:", inputs);
        try {
            if (!this.getAccessTokenSilently) {
                throw new Error("No se encontró método para obtener token. Por favor, inicia sesión.");
            }

            // Obtener el snippet para tener código y versión
            const snippet = await this.getSnippetById(snippetId);
            if (!snippet) {
                throw new Error("Snippet no encontrado");
            }

            const code = snippet.content ?? "";
            // Hardcodear temporalmente a versión 1.1
            const version = "1.1";

            // Llamar al runner-service para ejecutar el snippet (usando token obtenido al vuelo)
            const response = await this.fetchWithAuth(`${RUNNER_SERVICE_URL}/api/printscript/interpret`, {
                method: "POST",
                body: JSON.stringify({
                    version: version,
                    code: code,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error al ejecutar snippet: ${response.status} - ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error in runSnippet:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Error desconocido al ejecutar snippet");
        }
    }

}