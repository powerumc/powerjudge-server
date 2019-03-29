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
  outExt: string;
}

const mappings: ICompilerMapping = {
  "cs": {
    name: "C#",
    image: "powerjudge/powerjudge-compiler-mono:latest",
    compile: "mcs",
    runtime: "mono",
    compileOption(args: string[]) { },
    runtimeOption(args: string[]) { },
    outExt: ".exe"
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
