import {Injectable} from "@nestjs/common";
import * as _ from "lodash";
import {ApplicationLoggerService, ILanguageResponse, IFilesRequest, IFile} from "powerjudge-common";
import * as npath from "path";

export interface ICompilerMapping {
  [name: string]: ICompilerMappingVersion;
}

export interface ICompilerMappingVersion {
  [name: string]: ICompilerMappingItem
}

export interface ICompilerMappingItem {
  name: string;
  image: string;
  compile?: string;
  runtime?: string;
  compileOption?: (files: string[], entry?: string) => string | undefined;
  runtimeOption?: (files: string[], entry?: string) => string | undefined;
}

export interface ICompilerMappingOutOption {
  filename: string;
  ext: string;
}

const getDefaultCompileOption = (args: string[]) => args.join(" ");

const mappings: ICompilerMapping = {
  "cs": {
    "5.20.1.19": {
      name: "C#",
      image: "powerjudge/powerjudge-compiler-mono:5.20.1.19",
      compile: "mcs",
      runtime: "mono",
      compileOption: (files, entry) => `${files.join(" ")} -out:pj.exe`,
      runtimeOption: (files, entry) => "pj.exe"
    },
    "5.18.1.0": {
      name: "C#",
      image: "powerjudge/powerjudge-compiler-mono:5.18.1.0",
      compile: "mcs",
      runtime: "mono",
      compileOption: (files, entry) => `${files.join(" ")} -out:pj.exe`,
      runtimeOption: (files, entry) => "pj.exe"
    }
  },
  "c": {
    "8.3.0": {
      name: "C",
      image: "powerjudge/powerjudge-compiler-gcc:8.3.0",
      compile: "cc",
      runtime: "./pj.out",
      compileOption: (files, entry) => `${files.join(" ")} -o pj.out`
    }
  },
  "bash": {
    "5.0.7": {
      name: "bash",
      image: "powerjudge/powerjudge-compiler-bash:5.0.7",
      runtime: "bash",
      runtimeOption: (files, entry) => getEntryFile(files, entry)
    }
  }
};

function getEntryFile(files: string[], entry?: string): string {
  if (files.length === 1) {
    return files[0];
  }
  return entry || "";
}


@Injectable()
export class CompileMappingService {

  constructor(private logger: ApplicationLoggerService) {
  }

  get(language: string, version?: string): ICompilerMappingItem {
    const mapping = mappings[language];
    if (!mapping) {
      throw new Error(`compile-mapping-service: get id=${language}`);
    }

    let mappingItem: ICompilerMappingItem | undefined;
    if (version) {
      mappingItem = mapping[version];
      if (!mappingItem)
        throw new Error(`compile-mapping-service: mappingVersion=${version} not exists`);
    } else {
      mappingItem = mapping[_.last(_.sortBy(Object.keys(mapping))) || ""];
    }

    if (!mappingItem) {
      throw new Error(`compile-mapping-service: language=${language}, version=${version} not exists`);
    }

    return mappingItem;
  }

  private getLanguagesAndVersions(): ILanguageResponse {
    const response: ILanguageResponse = {};
    Object.keys(mappings).map(o => response[o] = Object.keys(mappings[o]));

    return response;
  }
}
