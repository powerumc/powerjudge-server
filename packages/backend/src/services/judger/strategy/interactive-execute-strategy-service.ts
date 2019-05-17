import MemoryStream = require("memorystream");
import * as _ from "lodash";
import * as npath from "path";
import {Injectable} from "@nestjs/common";
import {IExecuteStrategy} from "./interfaces";
import * as Dockerode from "dockerode";
import {ICompilerMappingItem} from "../compile-mapping-service";
import {IExecuteResult, ApplicationLoggerService, IFile, StopWatch, SubscribeChannel, RedisService} from "powerjudge-common";
import {DockerService} from "../../docker";
import * as child from "child_process";
import * as pty from "node-pty";

@Injectable()
export class InteractiveExecuteStrategyService implements IExecuteStrategy {

  constructor(private logger: ApplicationLoggerService,
              private redis: RedisService,
              private docker: DockerService) {

  }

  execute(container: Dockerode.Container, request, mapping: ICompilerMappingItem, channel: SubscribeChannel): Promise<IExecuteResult> {
    const stopwatch = StopWatch.start();
    this.logger.info(`interactive-execute-strategy-service: execute request=${JSON.stringify(request)}`);

    return new Promise<IExecuteResult>(async (resolve, reject) => {
      try {
        const filePaths = [];
        this.getFilePaths(request.files, "./", filePaths);

        const runtimeCmd = `${mapping.runtime} ${mapping.runtimeOption(filePaths)}`;
        const dockerCmd = `docker exec -it ${container.id} ${runtimeCmd}`;
        this.logger.info(`interactive-execute-strategy-service: execute container=${container.id}, dockerCmd=${dockerCmd}`);

        let stderr = "";
        let stdout = "";

        const term = pty.spawn("bash", ["-c", dockerCmd], {});

        term.on("data", data => {
          stdout += data;
          this.logger.info("data:");
          this.logger.info(data);
          this.redis.publish(channel.key, {
            command: "stdout",
            message: data,
            sender: "backend"
          });
        });

        term.on("exit", () => {
          stopwatch.end();
          resolve({
            stderr,
            stdout,
            success: true,
            elapsed: stopwatch.elapsed
          });
        });

        // const runtimeCmd = `${mapping.runtime} ${mapping.runtimeOption(filePaths)}`;
        // this.logger.info(`interactive-execute-strategy-service: execute container=${container.id}, runtimeCmd=${runtimeCmd}`);
        //
        // const exec = await this.docker.exec(container, ["bash", "-c", runtimeCmd]);
        // const stream = await exec.start({Tty: true, hijack: true, stdin: true});
        //
        // const ms = new MemoryStream();
        // stream.output.pipe(ms);
        //
        // let stderr = "";
        // let stdout = "";
        //
        // ms.on("data", data => {
        //   const value = data.toString("utf8");
        //   stdout += value;
        //   this.logger.info("attach-stream:");
        //   this.logger.info(value);
        //   // ms.write(data);
        //   this.redis.publish(channel.key, {
        //     command: "stdout",
        //     message: value,
        //     sender: "backend"
        //   });
        // });
        // ms.on("error", error => {
        //   const value = error.toString();
        //   stderr += value;
        //   console.log("attach-stream: error = ", value);
        //   // ms.write(error);
        //   this.redis.publish(channel.key, {
        //     command: "stderr",
        //     message: value,
        //     sender: "backend"
        //   });
        // });
        // ms.on("end", () => {
        //   this.logger.info("interactive-execute-strategy-service: execute end");
        //   ms.end();
        // });
        //
        // await container.wait();
        // stopwatch.end();
        // this.logger.info(`interactive-execute-strategy-service: execute end container=${container.id}, elapsed=${stopwatch.elapsed}`);
        //
        // resolve({
        //   stderr,
        //   stdout,
        //   success: true,
        //   elapsed: stopwatch.elapsed
        // });

      } catch(e) {
        this.logger.error(e);
        reject(e);
      }
    });

    // return new Promise<IExecuteResult>(async (resolve, reject) => {
    //   try {
    //     const attachStream = await container.attach({
    //       stream: true,
    //       stdin: true,
    //       stdout: true,
    //       stderr: true
    //     });
    //     const ms = new MemoryStream();
    //     attachStream.pipe(ms);
    //     container.modem.demuxStream(ms, process.stdout, process.stderr);
    //
    //     attachStream.on("data", data => {
    //       console.log("attach-stream: data = ", data);
    //       ms.write(data);
    //       channel.send({
    //         command: "stdout",
    //         message: data,
    //         sender: "backend"
    //       });
    //     });
    //     attachStream.on("error", error => {
    //       console.log("attach-stream: error = ", error);
    //       ms.write(error);
    //       channel.send({
    //         command: "stderr",
    //         message: error,
    //         sender: "backend"
    //       });
    //     });
    //     attachStream.on("end", () => {
    //       this.logger.info("interactive-execute-strategy-service: execute end");
    //       ms.end();
    //     });
    //
    //     await container.wait();
    //     stopwatch.end();
    //     this.logger.info(`interactive-execute-strategy-service: execute end container=${container.id}, elapsed=${stopwatch.elapsed}`);
    //
    //   } catch (e) {
    //     this.logger.error(e);
    //     reject(e);
    //   }


      // try {
      //   const filePaths = [];
      //   this.getFilePaths(request.files, "./", filePaths);
      //
      //   const runtimeCmd = `${mapping.runtime} ${mapping.runtimeOption(filePaths)}`;
      //   const dockerCmd = `docker exec ${container.id} ${runtimeCmd}`;
      //   this.logger.info(`compile-service: execute container=${container.id}, dockerCmd=${dockerCmd}`);
      //
      //   const proc = child.exec(dockerCmd, (error, stdout, stderr) => {
      //     this.logger.info(`compile-service: execute child.exec container=${container.id}, error=${JSON.stringify({error, stderr, stdout})}`);
      //     this.logger.info(`compile-service: execute child.exec end container=${container.id}, elapsed=${stopwatch.end().elapsed}`);
      //
      //     resolve({
      //       stderr,
      //       stdout,
      //       success: !error,
      //       elapsed: stopwatch.elapsed
      //     })
      //   });
      // } catch(e) {
      //   this.logger.error(e);
      //   reject(e);
      // }
    // });
  }

  private getFilePaths(files: IFile[], path: string, list: string[]) {
    for(const file of files) {
      const isFile = _.isString(file.value);

      if (isFile) {
        list.push(npath.join(path, file.name));
      } else {
        this.getFilePaths(<IFile[]>file.value, npath.join(path, file.name), list);
      }
    }
  }

}
