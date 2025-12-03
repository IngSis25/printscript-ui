import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useCallback } from "react";
import { fetchCreateUser } from "./fetchCreateUser.ts";
import {fetchGetDefaultRules} from "./fetchGetDefaultRules.ts";

const useAuthCallback = () => {
    const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently, user } = useAuth0();
    const navigate = useNavigate();
    const email = user?.email;

    const handleAuth = useCallback(async (email: string) => {
        if (isAuthenticated) {
            try {
                const user = await fetchCreateUser(email);
                if (user) {
                    await fetchGetDefaultRules();
                    navigate("/");
                }
            } catch (error) {
                console.error("Failed to create user:", error);
            }
        } else {
            try {
                await loginWithRedirect();
            } catch (error) {
                console.error("Login failed:", error);
            }
        }
    }, [isAuthenticated, getAccessTokenSilently, loginWithRedirect, navigate]);

    useEffect(() => {
        if (isLoading || !email) return;
        handleAuth(email).then();
    }, [email, isLoading]);
};

export default useAuthCallback;