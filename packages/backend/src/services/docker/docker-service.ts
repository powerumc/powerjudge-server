import {Injectable} from "@nestjs/common";
import * as Dockerode from "dockerode";
import {ApplicationLoggerService} from "powerjudge-common";
import {ApplicationConfigurationService} from "../configurations";

@Injectable()
export class DockerService {
  private docker: Dockerode;

  constructor(private logger: ApplicationLoggerService,
              private config: ApplicationConfigurationService) {
    const value = config.value.servers.docker;
    this.docker = new Dockerode({
      host: value.host,
      protocol: value.protocol,
      socketPath: value.socketPath,
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
      Cmd: ["/bin/bash"],
      HostConfig: {
        Binds: [`${bindHostPath}:${bindContainerPath}`],
        Dns: ['8.8.8.8', '8.8.4.4'],
        CpuPeriod: 100000,
        CpuQuota: 10000
      }
    };

    this.logger.info(`docker-service: create option=${JSON.stringify(option)}`);

    try {
      return await this.docker.createContainer(option);
    } catch(e) {
      this.logger.error(e);
      throw e;
    }
  }

  async start(container: Dockerode.Container) {
    try {
      await container.start()
    } catch(e) {
      this.logger.error(e);
      throw e;
    }
  }

  async attach(container: Dockerode.Container): Promise<NodeJS.ReadWriteStream> {
    try {
      return await container.attach({
        stream: true,
        stdin: true,
        stdout: true,
        stderr: true,
        hijack: true
      });

    } catch(e) {
      this.logger.error(e);
      throw e;
    }
  }

}
