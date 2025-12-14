import axios from "axios";

let tokenProvider: (() => Promise<string>) | null = null;

export const setTokenProvider = (provider: () => Promise<string>) => {
    tokenProvider = provider;
};

const axiosInstance = axios.create({
    baseURL: "/api",
    headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(async (config) => {
    if (tokenProvider) {
        const token = await tokenProvider();
        if (token && token !== "undefined" && token !== "null") {
            config.headers = config.headers || {};
            config.headers["Authorization"] = `Bearer ${token}`;
        }
    }
    return config;
});

export { axiosInstance };
