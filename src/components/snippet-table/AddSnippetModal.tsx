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
    Typography
} from "@mui/material";
import {highlight, languages} from "prismjs";
import {useEffect, useMemo, useState} from "react";
import Editor from "react-simple-code-editor";

import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-okaidia.css";
import {Save} from "@mui/icons-material";
import {CreateSnippet, CreateSnippetWithLang} from "../../utils/snippet.ts";
import {ModalWrapper} from "../common/ModalWrapper.tsx";
import {useCreateSnippet, useGetFileTypes} from "../../utils/queries.tsx";
import {queryClient} from "../../App.tsx";

export const AddSnippetModal = ({open, onClose, defaultSnippet}: {
    open: boolean,
    onClose: () => void,
    defaultSnippet?: CreateSnippetWithLang
}) => {
    const [language, setLanguage] = useState(defaultSnippet?.language ?? "Printscript");
    const [version, setVersion] = useState(defaultSnippet?.version ?? "");
    const [code, setCode] = useState(defaultSnippet?.content ?? "");
    const [snippetName, setSnippetName] = useState(defaultSnippet?.name ?? "")
    const {mutateAsync: createSnippet, isLoading: loadingSnippet} = useCreateSnippet({
        onSuccess: () => queryClient.invalidateQueries('listSnippets')
    })
    const {data: fileTypes, isLoading: loadingFileTypes, error: fileTypesError} = useGetFileTypes();

    // Obtener las versiones disponibles para el lenguaje seleccionado
    const availableVersions = useMemo(() => {
        return fileTypes
            ?.filter((f) => f.language === language)
            .map((f) => ({ version: f.version, extension: f.extension, id: f.id }))
            .filter((v, index, self) => 
                index === self.findIndex((t) => t.version === v.version)
            ) || [];
    }, [fileTypes, language]);

    // Cuando cambia el lenguaje, seleccionar la primera versión disponible
    useEffect(() => {
        if (availableVersions.length > 0 && !version) {
            setVersion(availableVersions[0].version);
        }
    }, [language, availableVersions, version]);

    useEffect(() => {
        console.log("FileTypes data:", fileTypes);
        console.log("Loading fileTypes:", loadingFileTypes);
        console.log("FileTypes error:", fileTypesError);
    }, [fileTypes, loadingFileTypes, fileTypesError]);

    const handleCreateSnippet = async () => {
        const selectedFileType = fileTypes?.find((f) => f.language === language && f.version === version);
        if (!selectedFileType) {
            throw new Error("No se pudo encontrar el tipo de archivo seleccionado");
        }
        const newSnippet: CreateSnippet = {
            name: snippetName,
            content: code,
            language: language,
            extension: selectedFileType.extension,
            version: selectedFileType.version,
            languageId: selectedFileType.id, // Enviar el ID del lenguaje para evitar ambigüedad
        }
        await createSnippet(newSnippet);
        onClose();
    }

    useEffect(() => {
        if (defaultSnippet) {
            setCode(defaultSnippet?.content)
            setLanguage(defaultSnippet?.language)
            setVersion(defaultSnippet?.version)
            setSnippetName(defaultSnippet?.name)
        }
    }, [defaultSnippet]);

    return (
        <ModalWrapper open={open} onClose={onClose}>
            {
                <Box sx={{display: 'flex', flexDirection: "row", justifyContent: "space-between"}}>
                    <Typography id="modal-modal-title" variant="h5" component="h2"
                                sx={{display: 'flex', alignItems: 'center'}}>
                        Add Snippet
                    </Typography>
                    <Button disabled={!snippetName || !code || !language || !version || loadingSnippet} variant="contained"
                            disableRipple
                            sx={{boxShadow: 0}} onClick={handleCreateSnippet}>
                        <Box pr={1} display={"flex"} alignItems={"center"} justifyContent={"center"}>
                            {loadingSnippet ? <CircularProgress size={24}/> : <Save/>}
                        </Box>
                        Save Snippet
                    </Button>
                </Box>
            }
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <InputLabel htmlFor="name">Name</InputLabel>
                <Input onChange={e => setSnippetName(e.target.value)} value={snippetName} id="name"
                       sx={{width: '50%'}}/>
            </Box>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <InputLabel htmlFor="language">Language</InputLabel>
                <Select
                    labelId="language-select-label"
                    id="language-select"
                    value={language}
                    onChange={(e: SelectChangeEvent<string>) => {
                        setLanguage(e.target.value);
                        setVersion(""); // Resetear versión al cambiar lenguaje
                    }}
                    sx={{width: '50%'}}
                    disabled={loadingFileTypes}
                >
                    {loadingFileTypes ? (
                        <MenuItem disabled>Loading languages...</MenuItem>
                    ) : fileTypesError ? (
                        <MenuItem disabled>Error loading languages</MenuItem>
                    ) : fileTypes && fileTypes.length > 0 ? (
                        // Mostrar solo lenguajes únicos
                        Array.from(new Set(fileTypes.map(x => x.language))).map(lang => (
                            <MenuItem data-testid={`menu-option-${lang}`} key={lang}
                                      value={lang}>{capitalize((lang))}</MenuItem>
                        ))
                    ) : (
                        <MenuItem disabled>No languages available</MenuItem>
                    )}
                </Select>
            </Box>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <InputLabel htmlFor="version">Version</InputLabel>
                <Select
                    labelId="version-select-label"
                    id="version-select"
                    value={version}
                    onChange={(e: SelectChangeEvent<string>) => setVersion(e.target.value)}
                    sx={{width: '50%'}}
                    disabled={loadingFileTypes || !language || availableVersions.length === 0}
                >
                    {loadingFileTypes ? (
                        <MenuItem disabled>Loading versions...</MenuItem>
                    ) : !language ? (
                        <MenuItem disabled>Select a language first</MenuItem>
                    ) : availableVersions.length === 0 ? (
                        <MenuItem disabled>No versions available for this language</MenuItem>
                    ) : (
                        availableVersions.map(v => (
                            <MenuItem data-testid={`menu-option-version-${v.version}`} key={v.version}
                                      value={v.version}>{v.version}</MenuItem>
                        ))
                    )}
                </Select>
            </Box>
            <InputLabel>Code Snippet</InputLabel>
            <Box width={"100%"} sx={{
                backgroundColor: 'black', color: 'white', borderRadius: "8px",
            }}>
                <Editor
                    value={code}
                    padding={10}
                    data-testid={"add-snippet-code-editor"}
                    onValueChange={(code) => setCode(code)}
                    highlight={(code) => highlight(code, languages.js, 'javascript')}
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
    )
}

