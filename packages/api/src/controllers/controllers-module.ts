import {Module} from "@nestjs/common";
import {CodeController, HealthCheckController, TestController} from "./apis";
import {ServicesModule} from "../services";

const controllers = [
  HealthCheckController,
  CodeController,
  TestController
];

@Module({
  imports: [ServicesModule],
  controllers: [...controllers]
})
export class ControllersModule { }
