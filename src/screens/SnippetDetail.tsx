import { useEffect, useState } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-okaidia.css";
import {
    Alert,
    Box,
    CircularProgress,
    IconButton,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
    useUpdateSnippetById,
    useSnippetsOperations,
    useRunSnippet,
} from "../utils/queries.tsx";
import {
    useFormatSnippet,
    useGetSnippetById,
    useShareSnippet,
} from "../utils/queries.tsx";
import { Bòx } from "../components/snippet-table/SnippetBox.tsx";
import {
    BugReport,
    Delete,
    Download,
    PlayArrow,
    Save,
    Share,
} from "@mui/icons-material";
import { ShareSnippetModal } from "../components/snippet-detail/ShareSnippetModal.tsx";
import { TestSnippetModal } from "../components/snippet-test/TestSnippetModal.tsx";
import { Snippet } from "../utils/snippet.ts";
import ReadMoreIcon from "@mui/icons-material/ReadMore";
import { queryClient } from "../App.tsx";
import { DeleteConfirmationModal } from "../components/snippet-detail/DeleteConfirmationModal.tsx";

type SnippetDetailProps = {
    id: string;
    handleCloseModal: () => void;
};

const DownloadButton = ({ snippet }: { snippet?: Snippet }) => {
    const snippetOps = useSnippetsOperations();

    if (!snippet) return null;

    const handleDownload = async () => {
        try {
            await snippetOps.downloadSnippet(snippet.id, false);
        } catch (err) {
            console.error("Error downloading snippet:", err);
            alert("No tenés permisos para descargar este snippet o ocurrió un error.");
        }
    };

    return (
        <Tooltip title="Download">
            <IconButton sx={{ cursor: "pointer" }} onClick={handleDownload}>
                <Download />
            </IconButton>
        </Tooltip>
    );
};

export const SnippetDetail = (props: SnippetDetailProps) => {
    const { id, handleCloseModal } = props;

    const [code, setCode] = useState("");
    const [inputsText, setInputsText] = useState("");
    const [outputs, setOutputs] = useState<string[]>([]);
    const [shareModalOppened, setShareModalOppened] = useState(false);
    const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] =
        useState(false);
    const [testModalOpened, setTestModalOpened] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const { data: snippet, isLoading } = useGetSnippetById(id);
    const { mutate: shareSnippet, isLoading: loadingShare } = useShareSnippet();
    const runMutation = useRunSnippet(id);

    const {
        mutate: formatSnippet,
        isLoading: isFormatLoading,
        data: formatSnippetData,
    } = useFormatSnippet(id);

    const { mutate: updateSnippet, isLoading: isUpdateSnippetLoading } =
        useUpdateSnippetById({
            onSuccess: () => {
                setValidationError(null);
                queryClient.invalidateQueries(["snippet", id]);
            },
        });

    useEffect(() => {
        if (snippet) {
            setCode(snippet.content ?? "");
        }
    }, [snippet]);

    useEffect(() => {
        if (formatSnippetData?.content != null) {
            setCode(formatSnippetData.content);
        }
    }, [formatSnippetData]);

    async function handleShareSnippet(userEmail: string, role: string) {
        shareSnippet({
            snippetId: id,
            userEmail: userEmail,
            role: role,
        });
    }

    const handleRun = () => {
        const inputs = inputsText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);

        runMutation.mutate(
            { inputs },
            {
                onSuccess: (res) => setOutputs(res.outputs ?? []),
                onError: (e) => {
                    console.error(e);
                    setOutputs([`<error> ${(e as Error).message}`]);
                },
            }
        );
    };

    return (
        <Box
            p={4}
            sx={{
                width: { xs: "90vw", sm: "75vw", md: "60vw" },
                maxWidth: 900,
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 6,
            }}
        >
            <Box
                width={"100%"}
                mb={2}
                display={"flex"}
                justifyContent={"flex-end"}
                alignItems="center"
            >
                <CloseIcon style={{ cursor: "pointer" }} onClick={handleCloseModal} />
            </Box>

            {isLoading ? (
                <>
                    <Typography fontWeight={"bold"} mb={2} variant="h4">
                        Loading...
                    </Typography>
                    <CircularProgress />
                </>
            ) : (
                <>
                    <Typography variant="h4" fontWeight={"bold"} mb={1}>
                        {snippet?.name ?? "Snippet"}
                    </Typography>

                    <Box
                        display="flex"
                        flexWrap="wrap"
                        flexDirection="row"
                        gap={1}
                        padding="8px 0"
                        mb={1}
                    >
                        <Tooltip title={"Share"}>
                            <IconButton onClick={() => setShareModalOppened(true)}>
                                <Share />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={"Test"}>
                            <IconButton onClick={() => setTestModalOpened(true)}>
                                <BugReport />
                            </IconButton>
                        </Tooltip>
                        <DownloadButton snippet={snippet} />

                        <Tooltip title={"Format"}>
                            <IconButton
                                onClick={() => formatSnippet()}
                                disabled={isFormatLoading}
                            >
                                <ReadMoreIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title={"Run"}>
                            <IconButton onClick={handleRun} disabled={runMutation.isLoading}>
                                {runMutation.isLoading ? (
                                    <CircularProgress size={20} />
                                ) : (
                                    <PlayArrow />
                                )}
                            </IconButton>
                        </Tooltip>

                        <Tooltip title={snippet?.userRole === "Viewer" ? "No tenés permisos para editar este snippet" : "Save changes"}>
                            <span>
                                <IconButton
                                    color={"primary"}
                                    onClick={() =>
                                        updateSnippet(
                                            { id: id, updateSnippet: { content: code } },
                                            {
                                                onError: (error: any) => {
                                                    const e = error as {
                                                        message?: string;
                                                        diagnostics?: any[];
                                                    };
                                                    const diag = e.diagnostics?.[0];

                                                    if (diag) {
                                                        setValidationError(
                                                            `Regla: ${diag.ruleId} – ${diag.message} (línea ${diag.line}, columna ${diag.col})`
                                                        );
                                                    } else {
                                                        setValidationError(
                                                            e.message ?? "Error al guardar el snippet"
                                                        );
                                                    }
                                                },
                                            }
                                        )
                                    }
                                    disabled={isUpdateSnippetLoading || snippet?.content === code || snippet?.userRole === "Viewer"}
                                >
                                    <Save />
                                </IconButton>
                            </span>
                        </Tooltip>

                        <Tooltip title={"Delete"}>
                            <IconButton
                                onClick={() => setDeleteConfirmationModalOpen(true)}
                            >
                                <Delete color={"error"} />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {validationError && (
                        <Box mb={2}>
                            <Alert severity="error">{validationError}</Alert>
                        </Box>
                    )}

                    <Box display={"flex"} gap={2}>
                        <Bòx
                            flex={1}
                            height={"fit-content"}
                            overflow={"hidden"}
                            minHeight={"400px"}
                            bgcolor={"black"}
                            color={"white"}
                            code={code}
                        >
                            <Editor
                                value={code}
                                padding={10}
                                onValueChange={(code) => setCode(code)}
                                highlight={(code) => highlight(code, languages.js, "javascript")}
                                maxLength={1000}
                                readOnly={snippet?.userRole === "Viewer"}
                                style={{
                                    minHeight: "360px",
                                    maxHeight: "500px",
                                    overflow: "auto",
                                    fontFamily: "monospace",
                                    fontSize: 17,
                                    opacity: snippet?.userRole === "Viewer" ? 0.7 : 1,
                                    cursor: snippet?.userRole === "Viewer" ? "not-allowed" : "text",
                                }}
                            />
                        </Bòx>
                    </Box>
                    
                    {snippet?.userRole === "Viewer" && (
                        <Box mb={2}>
                            <Alert severity="info">
                                Tenés permisos de solo lectura (Viewer). No podés editar este snippet.
                            </Alert>
                        </Box>
                    )}

                    <Box pt={2} flex={1} marginTop={2}>
                        <Alert severity="info">Output</Alert>

                        <Box
                            flex={1}
                            height={"fit-content"}
                            minHeight={"140px"}
                            bgcolor={"black"}
                            color={"white"}
                            sx={{
                                p: 2,
                                whiteSpace: "pre-wrap",
                                fontFamily: "monospace",
                                mt: 1,
                            }}
                        >
                            {outputs.length ? (
                                outputs.join("\n")
                            ) : (
                                <span style={{ opacity: 0.5 }}>—</span>
                            )}
                        </Box>

                        <TextField
                            placeholder="Type your inputs here"
                            value={inputsText}
                            onChange={(e) => setInputsText(e.target.value)}
                            fullWidth
                            multiline
                            minRows={2}
                            sx={{ mt: 1 }}
                            helperText="Cada línea se envía como un input separado"
                        />
                    </Box>
                </>
            )}

            <ShareSnippetModal
                loading={loadingShare}
                open={shareModalOppened}
                onClose={() => setShareModalOppened(false)}
                onShare={handleShareSnippet}
            />

            <TestSnippetModal open={testModalOpened} onClose={() => setTestModalOpened(false)} snippetId={id}/>

            <DeleteConfirmationModal open={deleteConfirmationModalOpen}
                                     onClose={() => setDeleteConfirmationModalOpen(false)}
                                     id={snippet?.id ?? ""} setCloseDetails={handleCloseModal}/>
        </Box>
    );
};
