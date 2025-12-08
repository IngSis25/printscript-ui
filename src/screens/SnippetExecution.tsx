import {OutlinedInput} from "@mui/material";
import {highlight, languages} from "prismjs";
import Editor from "react-simple-code-editor";
import {Bòx} from "../components/snippet-table/SnippetBox.tsx";
import {useEffect, useState} from "react";

type SnippetExecutionProps = {
  outputs?: string[];
}

export const SnippetExecution = ({ outputs = [] }: SnippetExecutionProps) => {
  const [input, setInput] = useState<string>("")
  const [displayOutputs, setDisplayOutputs] = useState<string[]>([]);

  useEffect(() => {
    if (outputs && outputs.length > 0) {
      setDisplayOutputs(outputs);
    }
  }, [outputs]);

  const code = displayOutputs.join("\n")

  const handleEnter = (event: { key: string }) => {
    if (event.key === 'Enter') {
      //TODO: logic to send inputs to server
      setDisplayOutputs([...displayOutputs, input])
      setInput("")
    }
  };

    return (
      <>
        <Bòx flex={1} overflow={"none"} minHeight={200} bgcolor={'black'} color={'white'} code={code}>
            <Editor
              value={code}
              padding={10}
              onValueChange={(code) => setInput(code)}
              highlight={(code) => highlight(code, languages.js, 'javascript')}
              maxLength={1000}
              style={{
                  fontFamily: "monospace",
                  fontSize: 17,
              }}
            />
        </Bòx>
        <OutlinedInput onKeyDown={handleEnter} value={input} onChange={e => setInput(e.target.value)} placeholder="Type here" fullWidth/>
      </>
    )
}
