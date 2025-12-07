import {SnippetOperations} from "./snippetOperations.ts";
import {TestCaseResult} from "./queries.tsx";
import {TestCase} from "../types/TestCase.ts";
import {Rule} from "../types/Rule.ts";
import {FileType} from "../types/FileType.ts";
import {PaginatedUsers} from "./users.ts";
import {useCreateSnippet} from "../hooks/useCreateSnippet.ts";
import {CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from "./snippet.ts";
import {User} from "@auth0/auth0-react";
import {VITE_AUTH0_AUDIENCE} from "./constants.ts";
import {fetchFileTypes} from "../hooks/fetchFileTypes.ts";
import {fetchSnippetById} from "../hooks/fetchSnippetById.ts";
import {fetchUserSnippets} from "../hooks/fetchUserSnippets.ts";
import {fetchUpdateSnippet} from "../hooks/fetchUpdateSnippet.ts";
import {fetchShareSnippet} from "../hooks/fetchShareSnippets.ts";
import {axiosInstance} from "../hooks/axios.config.ts";
import {fetchUserFriends} from "../hooks/fetchUserFriends.ts";

const options = {
    authorizationParams: {
        audience: VITE_AUTH0_AUDIENCE,
    },
};

export class SnippetServiceOperations implements SnippetOperations {
    private user?: User;

    constructor(user?: User, private readonly getAccessTokenSilently?) {
        this.user = user
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
                const token = await this.getAccessTokenSilently(options);
                localStorage.setItem('access_token', token);
                console.log("Token obtained and stored for listSnippetDescriptors");
            }
            return await fetchUserSnippets(this.user.sub, page, pageSize, snippetName);
        } catch (error) {
            console.error("Error in listSnippetDescriptors:", error);
            throw error;
        }
    }

    createSnippet = async (createSnippet: CreateSnippet): Promise<Snippet> => {
        const token = await this.getAccessTokenSilently(options);
        localStorage.setItem('access_token', token);
        const {name, content, language, extension} = createSnippet;
        const owner = this.user?.email
        try {
            console.log("Token:" + localStorage.getItem('access_token'));
            return await useCreateSnippet(name, content, language, extension, token, owner);
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
                const token = await this.getAccessTokenSilently(options);
                localStorage.setItem('access_token', token);
                console.log("Token obtained and stored");
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

    async shareSnippet(snippetId: string, userEmail: string): Promise<Snippet> {
        const ownerEmail = this.user?.email;

        if (!userEmail) {
            throw new Error("User email not found");
        }

        return await fetchShareSnippet(snippetId, userEmail, ownerEmail);
    }


    getFormatRules(): Promise<Rule[]> {
        throw new Error("Method not implemented.");
    }

    getLintingRules(): Promise<Rule[]> {
        throw new Error("Method not implemented.");
    }

    getTestCases(snippetId: string): Promise<TestCase[]> {
        console.log(snippetId);
        throw new Error("Method not implemented.");
    }

    formatSnippet(snippet: string): Promise<string> {
        console.log(snippet);
        throw new Error("Method not implemented.");
    }

    postTestCase(testCase: Partial<TestCase>): Promise<TestCase> {
        console.log(testCase);
        throw new Error("Method not implemented.");
    }

    removeTestCase(id: string): Promise<string> {
        console.log(id);
        throw new Error("Method not implemented.");
    }

    deleteSnippet(id: string): Promise<string> {
        console.log(id);
        throw new Error("Method not implemented.");
    }

    testSnippet(testCase: Partial<TestCase>): Promise<TestCaseResult> {
        console.log(testCase);
        throw new Error("Method not implemented.");
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

}