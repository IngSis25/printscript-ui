import {Pagination} from "./pagination.ts";
import {FileType} from "../types/FileType.ts";

export type ComplianceEnum =
    'pending' |
    'failed' |
    'not-compliant' |
    'compliant'


export type CreateSnippet = {
  name: string;
  content: string;
  language: string;
  extension: string;
  version: string;
}

export type CreateSnippetWithLang = CreateSnippet & { language: string, version: string }

export type UpdateSnippet = {
    content: string
}

export type Snippet = CreateSnippet & {
    id: string
    userRole?: string  // "Editor", "Viewer", "Owner", or undefined if not loaded
} & SnippetStatus

export type SnippetWithErr = Snippet & {
    errors: string[]
}

type SnippetStatus = {
    status: ComplianceEnum;
    author: string;
    owner: string;
    compliance?: ComplianceEnum; // Para mostrar en la tabla
}
export type SnippetWithLintWarnings = Snippet & {
    lintWarnings: string[];
}
export type PaginatedSnippets = Pagination & {
    snippets: SnippetWithLintWarnings[]
}


export const getFileLanguage = (fileTypes: FileType[], fileExt?: string) => {

    return fileExt && fileTypes?.find(x => x.extension.replace(/^\./, '') === fileExt);
}