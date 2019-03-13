import {HttpServer, INestApplication, INestExpressApplication, Injectable, Logger, OnModuleInit} from "@nestjs/common";
import {NestApplicationOptions} from "@nestjs/common/interfaces/nest-application-options.interface";
import {ExpressFactory} from "@nestjs/core/adapters/express-factory";
import {NestContainer} from "@nestjs/core/injector/container";
import {ApplicationConfig} from "@nestjs/core/application-config";
import {NestApplication} from "@nestjs/core";
import {NestApplicationContextOptions} from "@nestjs/common/interfaces/nest-application-context-options.interface";
import {isFunction, isNil} from "@nestjs/common/utils/shared.utils";
import {ExpressAdapter} from "@nestjs/core/adapters/express-adapter";
import {MESSAGES} from "@nestjs/core/constants";
import {MetadataScanner} from "@nestjs/core/metadata-scanner";
import {ExceptionsZone} from "@nestjs/core/errors/exceptions-zone";
import {DependenciesScanner} from "@nestjs/core/scanner";
import {InstanceLoader} from "@nestjs/core/injector/instance-loader";

@Injectable()
export class ApplicationService {

  private readonly logger = new Logger('NestFactory', true);
  private app: NestApplication;

  constructor() {
  }

  async init(module: any, serverOrOptions?: any, options?: NestApplicationOptions) {
    const isHttpServer = serverOrOptions && serverOrOptions.patch;
    let [httpServer, appOptions] = isHttpServer
      ? [serverOrOptions, options]
      : [ExpressFactory.create(), serverOrOptions];

    const applicationConfig = new ApplicationConfig();
    const container = new NestContainer(applicationConfig);
    httpServer = this.applyExpressAdapter(httpServer);

    this.applyLogger(appOptions);
    await this.initialize(module, container, applicationConfig, httpServer);
    this.app = this.createNestInstance<NestApplication>(
      new NestApplication(container, httpServer, applicationConfig, appOptions),
    );

    return this.app;
  }

  get(type) {
    return this.app.get(type);
  }

  run(value: number | undefined) {
  }

  private applyLogger(options: NestApplicationContextOptions | undefined) {
    if (!options) {
      return;
    }
    !isNil(options.logger) && Logger.overrideLogger(options.logger);
  }

  private applyExpressAdapter(httpAdapter: HttpServer): HttpServer {
    const isAdapter = httpAdapter.getHttpServer;
    if (isAdapter) {
      return httpAdapter;
    }
    return new ExpressAdapter(httpAdapter);
  }

  private async initialize(
    module,
    container: NestContainer,
    config = new ApplicationConfig(),
    httpServer: HttpServer,
  ) {
    const instanceLoader = new InstanceLoader(container);
    const dependenciesScanner = new DependenciesScanner(
      container,
      new MetadataScanner(),
      config,
    );
    container.setApplicationRef(httpServer);
    try {
      this.logger.log(MESSAGES.APPLICATION_START);
      await ExceptionsZone.asyncRun(async () => {
        await dependenciesScanner.scan(module);
        await instanceLoader.createInstancesOfDependencies();
        dependenciesScanner.applyApplicationProviders();
      });
    } catch (e) {
      process.abort();
    }
  }

  private createNestInstance<T>(instance: T): T {
    return this.createProxy(instance);
  }

  private createProxy(target) {
    const proxy = this.createExceptionProxy();
    return new Proxy(target, {
      get: proxy,
      set: proxy,
    });
  }

  private createExceptionProxy() {
    return (receiver, prop) => {
      if (!(prop in receiver)) return;

      if (isFunction(receiver[prop])) {
        return (...args) => {
          let result;
          ExceptionsZone.run(() => {
            result = receiver[prop](...args);
          });
          return result;
        };
      }
      return receiver[prop];
    };
  }
}
