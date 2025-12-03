import axios from "axios";


const axiosInstance = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

export const setAuthorizationToken = (token: string) => {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

export { axiosInstance };