import { defineConfig } from "cypress";
import dotenv from 'dotenv'

// Cargar variables de entorno desde .env
dotenv.config()

export default defineConfig({
  e2e: {
    setupNodeEvents(_, config) {
      // Pasar todas las variables de entorno a los tests
      config.env = process.env
      return config
    },
    experimentalStudio: true,
    // Usar la URL del frontend desde variables de entorno o un valor por defecto
    baseUrl: process.env.VITE_FRONTEND_URL || "http://localhost:5173",
  },
});
