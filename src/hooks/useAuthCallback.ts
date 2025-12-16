import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useCallback } from "react";
import { fetchGetDefaultRules } from "./fetchGetDefaultRules.ts";

const useAuthCallback = () => {
    const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();
    const navigate = useNavigate();

    const handleAuth = useCallback(async () => {
        if (isLoading) return;

        if (!isAuthenticated) {
            // Si todavía no está autenticado, lo mandamos al login de Auth0
            try {
                await loginWithRedirect();
            } catch (error) {
                console.error("Login failed:", error);
            }
            return;
        }

        // Usuario autenticado: conseguimos el token y seguimos el flujo
        try {
            const token = await getAccessTokenSilently({
                authorizationParams: { scope: "read:snippets" },
            });

            // Guardar el token en localStorage (si querés seguir usando esto)
            if (!localStorage.getItem("access_token")) {
                localStorage.setItem("access_token", token);
            }

            // Cargar reglas por defecto
            await fetchGetDefaultRules();

            // Volver al home
            navigate("/");
        } catch (error) {
            console.error("Failed in auth callback:", error);
        }
    }, [isAuthenticated, isLoading, getAccessTokenSilently, loginWithRedirect, navigate]);

    useEffect(() => {
        handleAuth();
    }, [handleAuth]);
};

export default useAuthCallback;
