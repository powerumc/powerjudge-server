import {Injectable} from "@nestjs/common";
import {ApplicationLoggerService} from "../logging";
import * as Dockerode from "dockerode";

@Injectable()
export class DockerService {
  private docker: Dockerode;

  constructor(private logger: ApplicationLoggerService) {
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
