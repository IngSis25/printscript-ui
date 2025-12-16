import {
    Box,
    Button,
    capitalize,
    CircularProgress,
    Input,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Typography,
} from "@mui/material";
import { highlight, languages } from "prismjs";
import { useEffect, useMemo, useState } from "react";
import Editor from "react-simple-code-editor";

import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-okaidia.css";
import { Save } from "@mui/icons-material";
import { CreateSnippet, CreateSnippetWithLang } from "../../utils/snippet.ts";
import { ModalWrapper } from "../common/ModalWrapper.tsx";
import { useCreateSnippet, useGetFileTypes } from "../../utils/queries.tsx";
import { queryClient } from "../../App.tsx";

export const AddSnippetModal = ({
                                    open,
                                    onClose,
                                    defaultSnippet,
                                }: {
    open: boolean;
    onClose: () => void;
    defaultSnippet?: CreateSnippetWithLang;
}) => {
    const { mutateAsync: createSnippet, isLoading: loadingSnippet } = useCreateSnippet({
        onSuccess: () => queryClient.invalidateQueries("listSnippets"),
    });

    const {
        data: fileTypes,
        isLoading: loadingFileTypes,
        error: fileTypesError,
    } = useGetFileTypes();

    // Estados del formulario
    // Inicializar con el primer language disponible o el del defaultSnippet
    const [language, setLanguage] = useState(defaultSnippet?.language ?? "");
    const [version, setVersion] = useState(defaultSnippet?.version ?? "");
    const [, setLanguageId] = useState<string>(defaultSnippet?.languageId ?? "");
    const [code, setCode] = useState(defaultSnippet?.content ?? "");
    const [snippetName, setSnippetName] = useState(defaultSnippet?.name ?? "");

    // Lenguajes únicos (solo nombres)
    const availableLanguages = useMemo(() => {
        const list = Array.isArray(fileTypes) ? fileTypes : [];
        const names = list.map((ft) => ft.language).filter(Boolean);
        return Array.from(new Set(names));
    }, [fileTypes]);

    // Normalizar el estado del language cuando los fileTypes se cargan por primera vez
    // Esto maneja casos donde el language viene con la versión concatenada o con case diferente
    // Solo se ejecuta si hay un language establecido (no vacío)
    useEffect(() => {
        if (!fileTypes || fileTypes.length === 0 || availableLanguages.length === 0) return;
        if (!language || language.trim() === "") return; // Solo normalizar si hay un language establecido
        
        // Si el language actual contiene una versión (ej: "PrintScript 1.1"), separarlo
        const versionPatterns = [
            /\s+(\d+\.\d+)$/,
            /(\d+\.\d+)$/,
            /\s+(\d+)$/,
            /(\d+)$/,
            /\s+([A-Z0-9]+)$/,
            /([A-Z0-9]+)$/,
        ];
        
        let normalizedLanguage = language;
        let extractedVersion = version;
        
        // Si el language contiene una versión, extraerla
        for (const pattern of versionPatterns) {
            const match = normalizedLanguage.match(pattern);
            if (match) {
                if (!extractedVersion || extractedVersion.trim() === "") {
                    extractedVersion = match[1];
                }
                normalizedLanguage = normalizedLanguage.replace(pattern, "").trim();
                break;
            }
        }
        
        // Buscar el language normalizado en los fileTypes disponibles (case-insensitive)
        const matchingLanguage = availableLanguages.find(
            (lang) => lang.toLowerCase() === normalizedLanguage.toLowerCase()
        );
        
        if (matchingLanguage && matchingLanguage !== language) {
            console.log(`Normalizing language: "${language}" -> "${matchingLanguage}"`);
            setLanguage(matchingLanguage);
        } else if (!matchingLanguage && normalizedLanguage !== language && normalizedLanguage.trim() !== "") {
            // Si no encontramos coincidencia pero normalizamos el language, usar el normalizado
            // y buscar la primera versión disponible
            const firstAvailable = availableLanguages[0];
            if (firstAvailable) {
                console.log(`Language "${normalizedLanguage}" not found, using first available: "${firstAvailable}"`);
                setLanguage(firstAvailable);
            }
        }
        
        // Si extrajimos una versión del language y no hay versión seteada, actualizarla
        if (extractedVersion && (!version || version.trim() === "")) {
            setVersion(extractedVersion);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fileTypes]); // Solo cuando cambian los fileTypes (una vez al cargar)

    // Versiones disponibles para el lenguaje seleccionado
    const availableVersions = useMemo(() => {
        const list = Array.isArray(fileTypes) ? fileTypes : [];
        return list
            .filter((ft) => ft.language === language)
            .map((ft) => ({ version: ft.version, extension: ft.extension, id: String(ft.id) }))
            // dedupe por version (por si backend repite)
            .filter((v, idx, arr) => idx === arr.findIndex((t) => t.version === v.version));
    }, [fileTypes, language]);

    // Cuando se cargan los fileTypes por primera vez, establecer el primer language si no hay uno seleccionado
    // o si el language actual no coincide con ninguno disponible (case-insensitive)
    useEffect(() => {
        if (availableLanguages.length === 0) return;
        
        if (!language || language.trim() === "") {
            const firstLanguage = availableLanguages[0];
            console.log(`Setting initial language to: "${firstLanguage}"`);
            setLanguage(firstLanguage);
        } else {
            // Verificar si el language actual coincide con alguno disponible (case-insensitive)
            const matchingLanguage = availableLanguages.find(
                (lang) => lang.toLowerCase() === language.toLowerCase()
            );
            if (!matchingLanguage) {
                // Si no coincide, usar el primero disponible
                const firstLanguage = availableLanguages[0];
                console.log(`Language "${language}" not found in available languages, using: "${firstLanguage}"`);
                setLanguage(firstLanguage);
            } else if (matchingLanguage !== language) {
                // Si coincide pero con case diferente, normalizar al case correcto
                console.log(`Normalizing language case: "${language}" -> "${matchingLanguage}"`);
                setLanguage(matchingLanguage);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [availableLanguages]); // Solo cuando cambian los availableLanguages (una vez al cargar)
    
    // Cuando cambia el lenguaje, elegir primera versión si no hay una seteada
    useEffect(() => {
        if (!version && availableVersions.length > 0) {
            setVersion(availableVersions[0].version);
        }
    }, [availableVersions, version]);

    // Cada vez que (language, version) cambian, calcular languageId correcto
    useEffect(() => {
        const list = Array.isArray(fileTypes) ? fileTypes : [];
        const selected = list.find((ft) => ft.language === language && ft.version === version);
        setLanguageId(selected ? String(selected.id) : "");
    }, [fileTypes, language, version]);

    useEffect(() => {
        if (!defaultSnippet) return;
        setCode(defaultSnippet.content ?? "");
        
        // Normalizar el language del defaultSnippet (por si viene con versión concatenada)
        let normalizedLang = defaultSnippet.language ?? "Printscript";
        let normalizedVersion = defaultSnippet.version ?? "";
        
        // Si el language contiene una versión, separarlo
        const versionPatterns = [
            /\s+(\d+\.\d+)$/,
            /(\d+\.\d+)$/,
            /\s+(\d+)$/,
            /(\d+)$/,
            /\s+([A-Z0-9]+)$/,
            /([A-Z0-9]+)$/,
        ];
        
        for (const pattern of versionPatterns) {
            const match = normalizedLang.match(pattern);
            if (match) {
                if (!normalizedVersion || normalizedVersion.trim() === "") {
                    normalizedVersion = match[1];
                }
                normalizedLang = normalizedLang.replace(pattern, "").trim();
                break;
            }
        }
        
        setLanguage(normalizedLang);
        setVersion(normalizedVersion);
        setSnippetName(defaultSnippet.name ?? "");
        if (defaultSnippet.languageId) setLanguageId(String(defaultSnippet.languageId));
    }, [defaultSnippet]);

    useEffect(() => {
        console.log("FileTypes data:", fileTypes);
        console.log("Loading fileTypes:", loadingFileTypes);
        console.log("FileTypes error:", fileTypesError);
    }, [fileTypes, loadingFileTypes, fileTypesError]);

    const handleCreateSnippet = async () => {
        const list = Array.isArray(fileTypes) ? fileTypes : [];
        const selectedFileType = list.find(
            (ft) => ft.language === language && ft.version === version
        );

        if (!selectedFileType) {
            throw new Error("No se pudo encontrar el tipo de archivo seleccionado");
        }

        const newSnippet: CreateSnippet = {
            name: snippetName,
            content: code,
            language: selectedFileType.language,
            extension: selectedFileType.extension,
            version: selectedFileType.version,
            languageId: selectedFileType.id, // Long/number del backend
        };

        await createSnippet(newSnippet);
        onClose();
    };

    return (
        <ModalWrapper open={open} onClose={onClose}>
            <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                <Typography
                    id="modal-modal-title"
                    variant="h5"
                    component="h2"
                    sx={{ display: "flex", alignItems: "center" }}
                >
                    Add Snippet
                </Typography>

                <Button
                    disabled={!snippetName || !code || !language || !version || loadingSnippet}
                    variant="contained"
                    disableRipple
                    sx={{ boxShadow: 0 }}
                    onClick={handleCreateSnippet}
                >
                    <Box pr={1} display={"flex"} alignItems={"center"} justifyContent={"center"}>
                        {loadingSnippet ? <CircularProgress size={24} /> : <Save />}
                    </Box>
                    Save Snippet
                </Button>
            </Box>

            {/* Name */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <InputLabel htmlFor="name">Name</InputLabel>
                <Input
                    onChange={(e) => setSnippetName(e.target.value)}
                    value={snippetName}
                    id="name"
                    sx={{ width: "50%" }}
                />
            </Box>

            {/* Language (solo nombre) */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <InputLabel htmlFor="language-select">Language</InputLabel>
                <Select
                    id="language-select"
                    value={language}
                    onChange={(e: SelectChangeEvent<string>) => {
                        const newLang = e.target.value;
                        setLanguage(newLang);
                        setVersion(""); // fuerza a elegir la primera disponible del nuevo lenguaje
                    }}
                    sx={{ width: "50%" }}
                    disabled={loadingFileTypes}
                >
                    {loadingFileTypes ? (
                        <MenuItem disabled>Loading languages...</MenuItem>
                    ) : availableLanguages.length > 0 ? (
                        availableLanguages.map((lang) => (
                            <MenuItem data-testid={`menu-option-${lang}`} key={lang} value={lang}>
                                {capitalize(lang)}
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem disabled>No file types accepted</MenuItem>
                    )}
                </Select>
            </Box>

            {/* Version (solo versión) */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <InputLabel htmlFor="version-select">Version</InputLabel>
                <Select
                    id="version-select"
                    value={version}
                    onChange={(e: SelectChangeEvent<string>) => setVersion(e.target.value)}
                    sx={{ width: "50%" }}
                    disabled={loadingFileTypes || !language || availableVersions.length === 0}
                >
                    {loadingFileTypes ? (
                        <MenuItem disabled>Loading versions...</MenuItem>
                    ) : !language ? (
                        <MenuItem disabled>Select a language first</MenuItem>
                    ) : availableVersions.length === 0 ? (
                        <MenuItem disabled>No versions available for this language</MenuItem>
                    ) : (
                        availableVersions.map((v) => (
                            <MenuItem
                                data-testid={`menu-option-version-${v.version}`}
                                key={v.version}
                                value={v.version}
                            >
                                {v.version}
                            </MenuItem>
                        ))
                    )}
                </Select>

                {/* opcional: debug para ver qué languageId se va a mandar */}
                {/* <Typography variant="caption">languageId: {languageId || "—"}</Typography> */}
            </Box>

            {/* Code */}
            <InputLabel>Code Snippet</InputLabel>
            <Box width={"100%"} sx={{ backgroundColor: "black", color: "white", borderRadius: "8px" }}>
                <Editor
                    value={code}
                    padding={10}
                    data-testid={"add-snippet-code-editor"}
                    onValueChange={(c) => setCode(c)}
                    highlight={(c) => highlight(c, languages.js, "javascript")}
                    style={{
                        borderRadius: "8px",
                        overflow: "auto",
                        minHeight: "300px",
                        maxHeight: "600px",
                        width: "100%",
                        fontFamily: "monospace",
                        fontSize: 17,
                    }}
                />
            </Box>
        </ModalWrapper>
    );
};
