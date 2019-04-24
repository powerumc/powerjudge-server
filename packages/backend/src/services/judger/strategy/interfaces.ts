import * as Dockerode from "dockerode";
import {ICompilerMappingItem} from "../compile-mapping-service";
import {IExecuteResult, IBrokerMessage, IFilesRequest} from "powerjudge-common";

export interface ICreateContainerStrategy {
  createContainer(message: IBrokerMessage, mapping: ICompilerMappingItem): Promise<Dockerode.Container>
}

export interface ICompileStrategy {
  compile(container: Dockerode.Container, message, request, mapping: ICompilerMappingItem): Promise<IExecuteResult>;
}

export interface IExecuteStrategy {
  execute(container: Dockerode.Container, request: IFilesRequest, mapping: ICompilerMappingItem): Promise<IExecuteResult>;
}
