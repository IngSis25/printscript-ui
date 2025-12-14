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
    const [language, setLanguage] = useState(defaultSnippet?.language ?? "Printscript");
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

    // Versiones disponibles para el lenguaje seleccionado
    const availableVersions = useMemo(() => {
        const list = Array.isArray(fileTypes) ? fileTypes : [];
        return list
            .filter((ft) => ft.language === language)
            .map((ft) => ({ version: ft.version, extension: ft.extension, id: String(ft.id) }))
            // dedupe por version (por si backend repite)
            .filter((v, idx, arr) => idx === arr.findIndex((t) => t.version === v.version));
    }, [fileTypes, language]);

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

    // Si viene defaultSnippet, hidratar todo
    useEffect(() => {
        if (!defaultSnippet) return;
        setCode(defaultSnippet.content ?? "");
        setLanguage(defaultSnippet.language ?? "Printscript");
        setVersion(defaultSnippet.version ?? "");
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
