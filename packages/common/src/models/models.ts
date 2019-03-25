export type File = string;

export interface IFile {
  name: string;
  value: File | IFile[];
}

export interface IFilesRequest {
  language: string;
  files: IFile[]
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
