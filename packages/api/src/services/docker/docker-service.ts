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
}
