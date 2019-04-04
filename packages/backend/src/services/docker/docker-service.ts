import {Injectable} from "@nestjs/common";
import * as Dockerode from "dockerode";
import {ApplicationLoggerService, StopWatch} from "powerjudge-common";
import {ApplicationConfigurationService} from "../configurations";

@Injectable()
export class DockerService {
  private docker: Dockerode;

  private option: any;
  constructor(private logger: ApplicationLoggerService,
              private config: ApplicationConfigurationService) {

    this.option = config.value.servers.docker;
    this.docker = new Dockerode({
      host: this.option.host,
      protocol: this.option.protocol,
      socketPath: this.option.socketPath,
      timeout: 5000
    });
  }

  info(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.docker.info((err, data) => {
        if (err) {
          reject(err);
        }

        resolve(data);
      });
    });
  }

  async create(name: string, image: string, bindHostPath: string, bindContainerPath): Promise<Dockerode.Container> {
    const option: Dockerode.ContainerCreateOptions = {
      name: name,
      Image: image,
      AttachStderr: true,
      AttachStdin: true,
      AttachStdout: true,
      Tty: true,
      OpenStdin: true,
      StdinOnce: false,
      WorkingDir: bindContainerPath,
      Cmd: ["/bin/bash"],
      HostConfig: {
        Binds: [
          `${bindHostPath}:${bindContainerPath}`
        ],
        Dns: ['8.8.8.8', '8.8.4.4'],
        Memory: 1024*1024*256,
        // CpusetCpus: 1
        // CpuPeriod: 100000,
        // CpuQuota: 10000
      }
    };

    this.logger.info(`docker-service: create option=${JSON.stringify(option)}`);

    const stopwatch = StopWatch.start();
    try {
      return await this.docker.createContainer(option);
    } catch(e) {
      this.logger.error(e);
      throw e;
    } finally {
      this.logger.info(`docker-service: create container=${name}, elapsed=${stopwatch.end().elapsed}`);
    }
  }

  async start(container: Dockerode.Container) {
    const stopwatch = StopWatch.start();
    try {
      await container.start()
    } catch(e) {
      this.logger.error(e);
      throw e;
    } finally {
      this.logger.info(`docker-service: start container=${container.id}, elapsed=${stopwatch.end().elapsed}`);
    }
  }

  async attach(container: Dockerode.Container): Promise<NodeJS.ReadWriteStream> {
    const stopwatch = StopWatch.start();
    try {
      return await container.attach({
        stream: true,
        stdin: true,
        stdout: true,
        stderr: true
      });

    } catch(e) {
      this.logger.error(e);
      throw e;
    } finally {
      this.logger.info(`docker-service: attach container=${container.id}, elapsed=${stopwatch.end().elapsed}`);
    }
  }

  async exec(container: Dockerode.Container, cmd: string[]): Promise<any> {
    const stopwatch = StopWatch.start();
    try {
      return await container.exec({
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        Cmd: cmd
      })
    } catch(e) {
      this.logger.error(e);
      throw e;
    } finally {
      this.logger.info(`docker-service: exec container=${container.id}, elapsed=${stopwatch.end().elapsed}`);
    }
  }

  async remove(container: Dockerode.Container): Promise<void> {
    const stopwatch = StopWatch.start();
    try {
      await container.remove({
        force: true
      });
    } catch(e) {
      this.logger.error(e);
    } finally {
      this.logger.info(`docker-service: remove container=${container.id}, elapsed=${stopwatch.end().elapsed}`);
    }
  }

}
