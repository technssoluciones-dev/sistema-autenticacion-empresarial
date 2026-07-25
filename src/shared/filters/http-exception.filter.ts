import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  DomainException,
  EntityNotFoundException,
  BusinessRuleViolationException,
  InvalidValueObjectException,
} from '@shared/domain';

interface ErrorResponseBody {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error: string;
}

/**
 * Mapeo DomainException -> HTTP status. Vive acá (presentation) y no en
 * domain, a propósito: el dominio no sabe que existe HTTP (ver
 * `domain.exception.ts`). Orden por especificidad: `instanceof` de una
 * subclase concreta antes que el fallback genérico.
 */
function mapDomainExceptionToStatus(exception: DomainException): HttpStatus {
  if (exception instanceof EntityNotFoundException) {
    return HttpStatus.NOT_FOUND; // 404
  }
  if (exception instanceof BusinessRuleViolationException) {
    return HttpStatus.CONFLICT; // 409
  }
  if (exception instanceof InvalidValueObjectException) {
    return HttpStatus.BAD_REQUEST; // 400
  }
  // Subclase de DomainException no contemplada explícitamente todavía:
  // 422 es más honesto que un 500 (no es un fallo del servidor, es el
  // dominio rechazando la operación) y visibiliza el caso sin ocultarlo
  // como error interno.
  return HttpStatus.UNPROCESSABLE_ENTITY; // 422
}

/**
 * Normaliza TODAS las respuestas de error de la API a un formato consistente,
 * evitando filtrar stack traces o detalles internos al cliente.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const isDomainException = exception instanceof DomainException;

    const statusCode = isHttpException
      ? exception.getStatus()
      : isDomainException
        ? mapDomainExceptionToStatus(exception)
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException ? exception.getResponse() : null;

    const message =
      exceptionResponse && typeof exceptionResponse === 'object' && 'message' in exceptionResponse
        ? (exceptionResponse as { message: string | string[] }).message
        : isHttpException || isDomainException
          ? exception.message
          : 'Internal server error';

    const errorName =
      exceptionResponse && typeof exceptionResponse === 'object' && 'error' in exceptionResponse
        ? (exceptionResponse as { error: string }).error
        : isHttpException || isDomainException
          ? exception.name
          : 'InternalServerError';

    const body: ErrorResponseBody = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error: errorName,
    };

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} -> ${statusCode}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(statusCode).json(body);
  }
}
