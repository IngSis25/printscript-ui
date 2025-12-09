import {SnippetOperations} from '../snippetOperations'
import {FakeSnippetStore} from './fakeSnippetStore'
import {CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from '../snippet'
import autoBind from 'auto-bind'
import {PaginatedUsers} from "../users.ts";
import {TestCase} from "../../types/TestCase.ts";
import {TestCaseResult} from "../queries.tsx";
import {FileType} from "../../types/FileType.ts";
import {Rule} from "../../types/Rule.ts";

const DELAY: number = 1000

export class FakeSnippetOperations implements SnippetOperations {
  private readonly fakeStore = new FakeSnippetStore()

  constructor() {
    autoBind(this)
  }

  createSnippet(createSnippet: CreateSnippet): Promise<Snippet> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.createSnippet(createSnippet)), DELAY)
    })
  }

  getSnippetById(id: string): Promise<Snippet | undefined> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.getSnippetById(id)), DELAY)
    })
  }

  listSnippetDescriptors(page: number,pageSize: number): Promise<PaginatedSnippets> {
    const response: PaginatedSnippets = {
      page: page,
      page_size: pageSize,
      count: 20,
      snippets: page == 0 ? this.fakeStore.listSnippetDescriptors().splice(0,pageSize) : this.fakeStore.listSnippetDescriptors().splice(1,2)
    }

    return new Promise(resolve => {
      setTimeout(() => resolve(response), DELAY)
    })
  }

  updateSnippetById(id: string, updateSnippet: UpdateSnippet): Promise<Snippet> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.updateSnippet(id, updateSnippet)), DELAY)
    })
  }

  getUserFriends(name: string = "", page: number = 1, pageSize: number = 10): Promise<PaginatedUsers> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.getUserFriends(name,page,pageSize)), DELAY)
    })
  }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  shareSnippet(snippetId: string, _userId: string, _role: string): Promise<Snippet> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.getSnippetById(snippetId)!), DELAY)
    })
  }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getFormatRules(_version?: string): Promise<Rule[]> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.getFormatRules()), DELAY)
    })
  }

  getLintingRules(): Promise<Rule[]> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.getLintingRules()), DELAY)
    })
  }

  formatSnippet(snippetId: string): Promise<string> {
    return new Promise(resolve => {
      setTimeout(() => {
        const snippet = this.fakeStore.getSnippetById(snippetId)
        if (snippet) {
          resolve(this.fakeStore.formatSnippet(snippet.content ?? ""))
        } else {
          resolve("")
        }
      }, DELAY)
    })
  }

  getTestCases(): Promise<TestCase[]> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.getTestCases()), DELAY)
    })
  }

  postTestCase(testCase: TestCase): Promise<TestCase> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.postTestCase(testCase)), DELAY)
    })
  }

  removeTestCase(id: string): Promise<string> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.removeTestCase(id)), DELAY)
    })
  }

  testSnippet(): Promise<TestCaseResult> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.testSnippet()), DELAY)
    })
  }

  deleteSnippet(id: string): Promise<string> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.deleteSnippet(id)), DELAY)
    })
  }

  getFileTypes(): Promise<FileType[]> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.getFileTypes()), DELAY)
    })
  }

  modifyFormatRule(newRules: Rule[]): Promise<Rule[]> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.modifyFormattingRule(newRules)), DELAY)
    })
  }

  modifyLintingRule(newRules: Rule[]): Promise<Rule[]> {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.fakeStore.modifyLintingRule(newRules)), DELAY)
    })
  }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  runSnippet(snippetId: string, _inputs?: string[]): Promise<string[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        const snippet = this.fakeStore.getSnippetById(snippetId)
        if (snippet) {
          resolve(["Output from snippet execution"])
        } else {
          resolve([])
        }
      }, DELAY)
    })
  }

  downloadSnippet(snippetId: string, includeMetadata: boolean): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        // Simular descarga del snippet
        const snippet = this.fakeStore.getSnippetById(snippetId)
        if (snippet) {
          // En un caso real, aquí se descargaría el archivo
          console.log("Downloading snippet:", snippetId, "includeMetadata:", includeMetadata)
        }
        resolve()
      }, DELAY)
    })
  }
}
