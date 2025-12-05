// Constantes para usar en los tests de Cypress
// Estas leen de process.env que se configuran en cypress.config.ts

export const FRONTEND_URL = Cypress.env("VITE_FRONTEND_URL") || "http://localhost:5173";
export const BACKEND_URL = Cypress.env("BACKEND_URL") || "http://localhost:8001/api";
export const AUTH0_USERNAME = Cypress.env("AUTH0_USERNAME") || "";
export const AUTH0_PASSWORD = Cypress.env("AUTH0_PASSWORD") || "";

