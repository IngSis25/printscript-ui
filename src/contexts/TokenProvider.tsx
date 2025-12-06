import React, { createContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {SnippetOperations} from "../utils/snippetOperations.ts";
import {SnippetServiceOperations} from "../utils/SnippetServiceOperations.ts";
import {setAuthorizationToken} from "../hooks/axios.config.ts";


const SnippetsContext = createContext<SnippetOperations | null>(null);

interface TokenProviderProps {
    children: ReactNode;
}

export const TokenProvider: React.FC<TokenProviderProps> = ({ children }) => {
    const { getAccessTokenSilently, user, isAuthenticated, isLoading } = useAuth0();
    const [snippetOperations, setSnippetOperations] = useState<SnippetOperations | null>(null);

    const fetchToken = useCallback(async () => {
        if (!isAuthenticated || !user) {
            return;
        }
        try {
            const fetchedToken = await getAccessTokenSilently({ authorizationParams: { scope: 'read:snippets' } });

            setAuthorizationToken(fetchedToken);
            const snippetOps = new SnippetServiceOperations(user);
            setSnippetOperations(snippetOps);
        } catch (error) {
            console.error("Error fetching token:", error);
        }
    }, [getAccessTokenSilently, user, isAuthenticated]);

    useEffect(() => {
        if (!isLoading && isAuthenticated && user) {
            fetchToken();
        }
    }, [isLoading, isAuthenticated, user, fetchToken]);

    // Don't block rendering if token is not yet available
    // The app can still function, and the token will be set when available
    if (!snippetOperations && isAuthenticated) {
        return <div>Cargando...</div>;
    }

    return (
        <SnippetsContext.Provider value={snippetOperations}>
            {children}
        </SnippetsContext.Provider>
    );
};