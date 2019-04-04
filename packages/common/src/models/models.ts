export type File = string;

export interface IFile {
  name: string;
  value: File | IFile[];
}

export interface IFilesRequest {
  language: string;
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

const request: IFilesRequest = {
  language: "cs",
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
