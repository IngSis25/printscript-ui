import { useEffect, useState } from "react";
import { TestCase } from "../../types/TestCase.ts";
import { Autocomplete, Box, Button, Chip, TextField, Typography } from "@mui/material";
import { BugReport, Delete, Save } from "@mui/icons-material";
import { useTestSnippet } from "../../utils/queries.tsx";
import { toast } from "react-toastify";

type TabPanelProps = {
    index: number;
    value: number;
    test?: TestCase;
    setTestCase: (test: Partial<TestCase>) => void;
    removeTestCase?: (testIndex: string) => void;
};

export const TabPanel = ({ value, index, test: initialTest, setTestCase, removeTestCase }: TabPanelProps) => {
    const [testData, setTestData] = useState<Partial<TestCase> | undefined>(initialTest);
    const [inputValue, setInputValue] = useState<string>("");
    const [outputValue, setOutputValue] = useState<string>("");
    const { mutateAsync: testSnippet } = useTestSnippet();

    useEffect(() => {
        if (initialTest) {
            setTestData({
                id: initialTest.id,
                name: initialTest.name,
                input: Array.isArray(initialTest.input) ? initialTest.input : [],
                output: Array.isArray(initialTest.output) ? initialTest.output : [],
            });
        } else {
            setTestData({ input: [], output: [] });
        }
        setInputValue("");
        setOutputValue("");
    }, [initialTest, index]);

    const handleTest = async () => {
        try {
            if (!testData?.id) {
                toast.error("El test debe tener un ID para ejecutarse. Guarda el test primero.");
                return;
            }
            console.log("Ejecutando test con datos:", testData);
            const result = await testSnippet(testData);
            console.log("Resultado del test:", result);
            if (result === "success") {
                toast.success("Test ejecutado correctamente 🎉");
            } else if (result === "fail") {
                toast.error("Test falló 😢");
            } else {
                toast.error("Error al ejecutar el test.");
            }
        } catch (error) {
            console.error("Error ejecutando test:", error);
            toast.error("Error al ejecutar el test. Por favor, intenta nuevamente.");
        }
    };

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            style={{ width: '100%', height: '100%' }}
        >
            {value === index && (
                <Box sx={{ px: 3 }} display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography fontWeight="bold">Name</Typography>
                        <TextField
                            size="small"
                            value={testData?.name ?? ""}
                            onChange={(e) => setTestData({ ...testData, name: e.target.value })}
                        />
                    </Box>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography fontWeight="bold">Input</Typography>
                        <Autocomplete
                            multiple
                            size="small"
                            id="tags-filled"
                            freeSolo
                            value={testData?.input ?? []}
                            inputValue={inputValue}
                            onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
                            onChange={(_, value) => {
                                setTestData({ ...testData, input: value });
                                setInputValue("");
                            }}
                            onBlur={() => {
                                if (inputValue.trim() && !testData?.input?.includes(inputValue.trim())) {
                                    setTestData({ 
                                        ...testData, 
                                        input: [...(testData?.input ?? []), inputValue.trim()] 
                                    });
                                    setInputValue("");
                                }
                            }}
                            renderTags={(value: readonly string[], getTagProps) =>
                                value.map((option: string, index: number) => (
                                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                                ))
                            }
                            renderInput={(params) => <TextField {...params} />}
                            options={[]}
                        />
                    </Box>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography fontWeight="bold">Output</Typography>
                        <Autocomplete
                            multiple
                            size="small"
                            id="tags-filled"
                            freeSolo
                            value={testData?.output ?? []}
                            inputValue={outputValue}
                            onInputChange={(_, newInputValue) => setOutputValue(newInputValue)}
                            onChange={(_, value) => {
                                setTestData({ ...testData, output: value });
                                setOutputValue("");
                            }}
                            onBlur={() => {
                                if (outputValue.trim() && !testData?.output?.includes(outputValue.trim())) {
                                    setTestData({ 
                                        ...testData, 
                                        output: [...(testData?.output ?? []), outputValue.trim()] 
                                    });
                                    setOutputValue("");
                                }
                            }}
                            renderTags={(value: readonly string[], getTagProps) =>
                                value.map((option: string, index: number) => (
                                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                                ))
                            }
                            renderInput={(params) => <TextField {...params} />}
                            options={[]}
                        />
                    </Box>
                    <Box display="flex" flexDirection="row" gap={1}>
                        {testData?.id && removeTestCase && (
                            <Button onClick={() => removeTestCase(testData.id ?? "")} variant="outlined" color="error" startIcon={<Delete />}>
                                Remove
                            </Button>
                        )}
                        <Button 
                            disabled={!testData?.name} 
                            onClick={() => {
                                console.log("Guardando test con datos:", testData);
                                setTestCase(testData ?? {});
                            }} 
                            variant="outlined" 
                            startIcon={<Save />}
                        >
                            Save
                        </Button>
                        {testData?.id && (
                            <Button onClick={handleTest} variant="contained" startIcon={<BugReport />} disableElevation>
                                Test
                            </Button>
                        )}
                    </Box>
                </Box>
            )}
        </div>
    );
};