import {Module} from "@nestjs/common";
import {HealthCheckController, TestController} from "./apis";
import {ServicesModule} from "../services";

const controllers = [
  HealthCheckController,
  TestController
];

@Module({
  imports: [ServicesModule],
  controllers: [...controllers]
})
export class ControllersModule { }
