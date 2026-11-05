import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../generated/prisma/client.js';

interface ErrorBody {
  statusCode: number;
  error: string;
  message: string;
  field?: string;
}

/**
 * Translates the Prisma errors a CRUD reaches predictably into HTTP responses,
 * so services and repositories never need `try/catch`:
 *
 * - `P2002` unique constraint violated -> 409 (duplicated `nombre`, etc.)
 * - `P2003` foreign key violated       -> 409 (missing parent or children)
 * - `P2025` row not found on write     -> 404
 * - `P2011`/`P2014` null/relation      -> 400
 *
 * Anything else keeps a generic 500 body; the error is logged first.
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter
  implements ExceptionFilter<Prisma.PrismaClientKnownRequestError>
{
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const response = host.switchToHttp().getResponse<Response>();
    const body = this.toHttpError(exception);

    if (body) {
      response.status(body.statusCode).json(body);
      return;
    }

    this.logger.error(
      `Unhandled Prisma error ${exception.code}: ${exception.message}`,
    );
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Error interno del servidor',
    });
  }

  private toHttpError(
    exception: Prisma.PrismaClientKnownRequestError,
  ): ErrorBody | null {
    switch (exception.code) {
      case 'P2002': {
        const target = exception.meta?.target;
        const field = Array.isArray(target)
          ? target.join(', ')
          : typeof target === 'string'
            ? target
            : undefined;

        return {
          statusCode: HttpStatus.CONFLICT,
          error: 'Conflict',
          message: field
            ? `Ya existe un registro con ese valor en "${field}"`
            : 'Ya existe un registro con ese valor único',
          field,
        };
      }
      case 'P2003':
        return {
          statusCode: HttpStatus.CONFLICT,
          error: 'Conflict',
          message:
            'El registro referenciado no existe o todavía tiene registros dependientes',
        };
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: 'Registro no encontrado',
        };
      case 'P2011':
      case 'P2014':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: 'Falta un campo obligatorio o una relación requerida',
        };
      default:
        return null;
    }
  }
}
