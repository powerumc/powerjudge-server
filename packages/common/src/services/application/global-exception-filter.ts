import {ArgumentsHost, Catch, ExceptionFilter} from "@nestjs/common";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    response.json({
      message: exception
    });
  }
}
