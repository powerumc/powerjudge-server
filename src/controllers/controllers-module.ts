import {Module} from "@nestjs/common";
import {HealthCheckController} from "src/controllers/apis";

@Module({
  controllers: [HealthCheckController]
})
export class ControllersModule { }
