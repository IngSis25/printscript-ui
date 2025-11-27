export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL ?? "http://localhost:5174"
export const BACKEND_URL = process?.env?.BACKEND_URL ?? "http://localhost:8000/api"
export const AUTH0_USERNAME = process?.env?.AUTH0_USERNAME ?? ""
export const AUTH0_PASSWORD = process?.env?.AUTH0_PASSWORD ?? ""
export const SNIPPETS_SERVICE_URL = import.meta.env.VITE_SNIPPETS_SERVICE_URL ?? "http://localhost:8001"

