import axios from "axios";
import {FileType} from "../types/FileType";
import {axiosInstance} from "./axios.config.ts";

interface ApiResponseItem {
    name: string;
    extension: string;
    version: string;
    id: string;
}

export const fetchFileTypes = async (): Promise<FileType[]> => {
    try {
        const response = await axiosInstance.get("api/languages/all")

        if (response.data === undefined) {
            return [];
        }

        console.log("Raw API response from /api/languages/all:", response.data);
        
        const mapped = response.data.map((item: ApiResponseItem) => {
            console.log("Mapping item:", item);
            
            // Normalizar: si el name contiene la versión (ej: "PrintScript 1.1"), separarlo
            let languageName = item.name || "";
            let version = item.version || "";
            
            // Si el name contiene un patrón como "PrintScript 1.1", "PrintScript1.1", "PrintScript 1.0", etc., separarlo
            // Patrón: nombre seguido de espacio (opcional) y versión (puede ser número, número.número, o alfanumérico como ES6)
            // Ejemplos: "PrintScript 1.1", "PrintScript1.1", "JavaScript ES6", "Python 3.10"
            const versionPatterns = [
                /\s+(\d+\.\d+)$/,           // "PrintScript 1.1" o "PrintScript 1.0"
                /(\d+\.\d+)$/,              // "PrintScript1.1" (sin espacio)
                /\s+(\d+)$/,                // "PrintScript 1" (versión simple)
                /(\d+)$/,                   // "PrintScript1" (sin espacio)
                /\s+([A-Z0-9]+)$/,          // "JavaScript ES6" o "Kotlin 3.6"
                /([A-Z0-9]+)$/,            // "JavaScriptES6" (sin espacio)
            ];
            
            // Si no hay versión separada, intentar extraerla del name
            if (!version || version.trim() === "") {
                for (const pattern of versionPatterns) {
                    const match = languageName.match(pattern);
                    if (match) {
                        version = match[1];
                        languageName = languageName.replace(pattern, "").trim();
                        console.warn(`⚠️ Detected version in name field. Extracted: language="${languageName}", version="${version}"`);
                        break;
                    }
                }
            }
            
            // Validar que tenemos los campos necesarios
            if (!languageName) {
                console.error("Item missing language name:", item);
            }
            if (!version) {
                console.warn("Item missing version:", item);
            }
            
            const result = {
                language: languageName,
                extension: item.extension || "",
                version: version,
                id: item.id ? String(item.id) : ""
            };
            console.log("Mapped result:", result);
            return result;
        }).filter((ft) => ft.language && ft.version) as FileType[]; // Filtrar items inválidos
        
        console.log("Final mapped fileTypes:", mapped);
        return mapped;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                return [];
            } else {
                throw new Error(error.response?.data?.message || error.message);
            }
        } else {
            throw new Error("An unexpected error occurred");
        }
    }
};

