import {Module} from "@nestjs/common";
import {HealthCheckController} from "./apis";

@Module({
  controllers: [HealthCheckController]
})
export class ControllersModule { }
