export type File = string;

export interface IFile {
  name: string;
  value: File | IFile[];
}

export interface IFilesRequest {
  language: string;
  version?: string;
  files: IFile[]
}

export interface IFilesResponse {
  result: string;
}

export interface IExecuteResult {
  stderr: string;
  stdout: string;
  success: boolean;
  elapsed?: number;
}

export interface ILanguageResponse {
  [name: string]: string[]
}

const request: IFilesRequest = {
  language: "cs",
  version: "5.18.1.0",
  files: [
    {
      name: "a.cs",
      value: "ASDASDAD"
    },
    {
      name: "dd",
      value: [
        {
          name: "b.cs",
          value: "SADASD"
        }
      ]
    }
  ]
};
