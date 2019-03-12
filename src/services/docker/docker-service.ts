import {createDecorator, register} from "src/decorators";
import {ApplicationLoggerService, IApplicationLoggerService} from "src/services/logging";
import * as Dockerode from "dockerode";

@register().inTransient()
export class DockerService {
  private docker: Dockerode;

  constructor(@IApplicationLoggerService private logger: ApplicationLoggerService) {
    this.docker = new Dockerode({
      host: "localhost",
      protocol: "http",
      socketPath: "/var/run/docker.sock",
      timeout: 5000
    });
  }

  infoAsync(): Promise<any> {
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

export const IDockerService = createDecorator(DockerService);
