import {Injectable} from "@nestjs/common";
import {ApplicationLoggerService} from "powerjudge-common";

export interface ICompilerMapping {
  [name: string]: ICompilerMappingItem;
}

export interface ICompilerMappingItem {
  name: string;
  image: string;
  compile: string;
  runtime: string;
  compileOption?: any;
  runtimeOption?: any;
  out: ICompilerMappingOutOption;
  joinOutputOption: (option: ICompilerMappingOutOption) => string;
}

export interface ICompilerMappingOutOption {
  option: string;
  filename: string;
  ext: string;
}

const getDefaultCompileOption = (args: string[]) => args.join(" ");

const mappings: ICompilerMapping = {
  "cs": {
    name: "C#",
    image: "powerjudge/powerjudge-compiler-mono:5.18.1.0",
    compile: "mcs",
    runtime: "mono",
    compileOption: getDefaultCompileOption,
    runtimeOption(args: string[]) { return "pj.exe" },
    out: {
      option: "-out",
      filename: "pj",
      ext: ".exe"
    },
    joinOutputOption: (option: ICompilerMappingOutOption) => `${option.option}:${option.filename}${option.ext}`
  }
};

@Injectable()
export class CompileMappingService {

  constructor(private logger: ApplicationLoggerService) {
  }

  get(id: string) {
    const mapping = mappings[id];
    if (!mapping) {
      throw new Error(`compile-mapping-service: get id=${id}`);
    }

    return mapping;
  }
}
