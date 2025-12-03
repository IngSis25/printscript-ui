import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {SnippetOperations} from "../utils/snippetOperations.ts";
import {SnippetServiceOperations} from "../utils/SnippetServiceOperations.ts";
import {setAuthorizationToken} from "../hooks/axios.config.ts";


const SnippetsContext = createContext<SnippetOperations | null>(null);

interface TokenProviderProps {
    children: ReactNode;
}

export const TokenProvider: React.FC<TokenProviderProps> = ({ children }) => {
    const { getAccessTokenSilently, user } = useAuth0();
    const [snippetOperations, setSnippetOperations] = useState<SnippetOperations | null>(null);

    useEffect(() => {
        fetchToken().then();
    }, [getAccessTokenSilently, user]);

    const fetchToken = async () => {
        try {
            const fetchedToken = await getAccessTokenSilently({ authorizationParams: { scope: 'read:snippets' } });

            setAuthorizationToken(fetchedToken);
            const snippetOps = new SnippetServiceOperations(user);
            setSnippetOperations(snippetOps);
        } catch (error) {
            console.error(error);
        }
    };

    if (!snippetOperations) return null;

    return (
        <SnippetsContext.Provider value={snippetOperations}>
            {children}
        </SnippetsContext.Provider>
    );
};