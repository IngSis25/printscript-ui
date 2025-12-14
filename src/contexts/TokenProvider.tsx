import React, { createContext, useEffect, useState, ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { SnippetOperations } from "../utils/snippetOperations";
import { SnippetServiceOperations } from "../utils/SnippetServiceOperations";
import { VITE_AUTH0_AUDIENCE } from "../utils/constants";
// si implementás setTokenProvider en axios.config:
// import { setTokenProvider } from "../hooks/axios.config";

const SnippetsContext = createContext<SnippetOperations | null>(null);

interface TokenProviderProps {
    children: ReactNode;
}

export const TokenProvider: React.FC<TokenProviderProps> = ({ children }) => {
    const { getAccessTokenSilently, user, isAuthenticated, isLoading } = useAuth0();
    const [snippetOperations, setSnippetOperations] = useState<SnippetOperations | null>(null);

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated || !user) {
            setSnippetOperations(null);
            return;
        }
        const ops = new SnippetServiceOperations(user, getAccessTokenSilently);
        setSnippetOperations(ops);

        getAccessTokenSilently({
            authorizationParams: { audience: VITE_AUTH0_AUDIENCE },
        }).catch((e) => console.warn("No se pudo obtener token silencioso", e));
    }, [isLoading, isAuthenticated, user, getAccessTokenSilently]);

    if (!snippetOperations && isAuthenticated) {
        return <div>Cargando...</div>;
    }

    return (
        <SnippetsContext.Provider value={snippetOperations}>
            {children}
        </SnippetsContext.Provider>
    );
};
