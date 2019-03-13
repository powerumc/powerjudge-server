import {ApplicationLoggerService} from "src/services/logging";
import {Request, Response} from "express";

export class SubmissionController {

  constructor(private logger: ApplicationLoggerService) {
  }
}
