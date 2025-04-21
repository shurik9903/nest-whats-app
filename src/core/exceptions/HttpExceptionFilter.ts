import {
  Catch,
  ArgumentsHost,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
  HttpException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { ExceptionBody } from './ExceptionBody';
import { ResourceNotFoundException } from './ResourceNotFound.exception';
import { AccessDeniedException } from './AccessDenied.exception';
import { AuthenticationException } from './Authentication.exception';
import { ImageUploadException } from './ImageUpload.exception';

@Catch()
export class HttpExceptionFilter extends BaseExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    // const request = ctx.getRequest<Request>();

    const exceptionBody: ExceptionBody = this.ExceptionFactory(exception);
    exceptionBody.toResponse(response);
  }

  private ExceptionFactory(exception: Error): ExceptionBody {
    console.log(exception);

    switch (exception.name) {
      case ResourceNotFoundException.name:
        return this.ResourceNotFoundExceptionHandler(
          exception as ResourceNotFoundException,
        );

      case UnauthorizedException.name:
        return this.UnauthorizedExceptionHandler(
          exception as UnauthorizedException,
        );

      case AccessDeniedException.name:
        return this.AccessDeniedExceptionHandler();

      case AuthenticationException.name:
        return this.AuthenticationExceptionHandler(
          exception as AuthenticationException,
        );

      case BadRequestException.name:
        return this.BadRequestExceptionHandler(
          exception as BadRequestException,
        );

      case ImageUploadException.name:
        return this.ImageUploadExceptionHandler(
          exception as ImageUploadException,
        );

      case UnprocessableEntityException.name:
        return this.UnprocessableEntityExceptionHandler(
          exception as UnprocessableEntityException,
        );

      case HttpException.name:
        return this.HttpExceptionHandler(exception as HttpException);

      default:
        return this.ExceptionHandler(exception);
    }
  }

  private ExceptionHandler(exception: Error): ExceptionBody {
    console.warn(exception);
    return new ExceptionBody({
      message: 'Internal error.',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }

  private HttpExceptionHandler(exception: HttpException): ExceptionBody {
    return new ExceptionBody({
      message: exception.message,
      status: exception.getStatus(),
    });
  }

  private BadRequestExceptionHandler(
    exception: BadRequestException,
  ): ExceptionBody {
    return new ExceptionBody({
      message: String(String(exception['response'])['message']),
      status: HttpStatus.BAD_REQUEST,
    });
  }

  private ResourceNotFoundExceptionHandler(
    exception: ResourceNotFoundException,
  ): ExceptionBody {
    return new ExceptionBody({
      message: exception.message,
      status: HttpStatus.NOT_FOUND,
    });
  }

  private AccessDeniedExceptionHandler(): ExceptionBody {
    return new ExceptionBody({
      message: 'Access denied.',
      status: HttpStatus.FORBIDDEN,
    });
  }

  private UnauthorizedExceptionHandler(
    exception: UnauthorizedException,
  ): ExceptionBody {
    return new ExceptionBody({
      message: exception.message,
      status: HttpStatus.FORBIDDEN,
    });
  }

  private AuthenticationExceptionHandler(
    exception: AuthenticationException,
  ): ExceptionBody {
    return new ExceptionBody({
      message: exception.message,
      status: HttpStatus.BAD_REQUEST,
    });
  }

  private ImageUploadExceptionHandler(
    exception: ImageUploadException,
  ): ExceptionBody {
    return new ExceptionBody({
      message: exception.message,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }

  private UnprocessableEntityExceptionHandler(
    exception: UnprocessableEntityException,
  ): ExceptionBody {
    return new ExceptionBody({
      message: exception.message,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
}
