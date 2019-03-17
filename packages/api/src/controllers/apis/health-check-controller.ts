import {Controller, Get} from "@nestjs/common";

@Controller("/api/hc")
export class HealthCheckController {

  @Get()
  healthCheck() {
    return "ok";
  }
}
