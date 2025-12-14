export const FRONTEND_URL =
    import.meta.env.VITE_FRONTEND_URL ?? "https://ingsis25.duckdns.org"

export const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL ?? "https://ingsis25.duckdns.org/api"

export const AUTH0_USERNAME =
    import.meta.env.VITE_AUTH0_USERNAME ?? "test@gmail.com"

export const AUTH0_PASSWORD =
    import.meta.env.VITE_AUTH0_PASSWORD ?? "Ingenieria2025!"

export const SNIPPETS_SERVICE_URL =
    import.meta.env.VITE_SNIPPETS_SERVICE_URL ?? "http://localhost:8001"

export const RUNNER_SERVICE_URL =
    import.meta.env.VITE_RUNNER_SERVICE_URL ?? "http://localhost:8000"

export const VITE_AUTH0_AUDIENCE =
    import.meta.env.VITE_AUTH0_AUDIENCE ?? "https://snippet-searcher.api"
