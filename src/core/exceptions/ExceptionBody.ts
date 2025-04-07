import { HttpStatus } from '@nestjs/common/enums';
import { Response } from 'express';

export class ExceptionBody {
  private _message: string;

  private _errors: Map<string, string>;

  private _status: HttpStatus;

  constructor(info: {
    message: string;
    errors?: Map<string, string>;
    status: HttpStatus;
  }) {
    this.message = info.message;
    this.errors = info.errors ?? new Map<string, string>();
    this.status = info.status;
  }

  toResponse(response: Response) {
    response.status(this.status).json({
      statusCode: this.status,
      timestamp: new Date().toISOString(),
      message: this.message,
      errors: this.errors,
    });
  }

  public get message(): string {
    return this._message;
  }

  public set message(value: string) {
    this._message = value;
  }

  public get errors(): Map<string, string> {
    return this._errors;
  }

  public set errors(value: Map<string, string>) {
    this._errors = value;
  }

  public get status(): HttpStatus {
    return this._status;
  }

  public set status(value: HttpStatus) {
    this._status = value;
  }
}
