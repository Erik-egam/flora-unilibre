import { Prisma } from '@/generated/prisma/client';

export interface ErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
  field?: string;
}

const ERROR_NAMES: Record<number, string> = {
  400: 'Bad Request',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Internal Server Error',
};

/**
 * An error that already knows the HTTP response it should produce. Services
 * throw it; `apiErrorResponse` turns it into a `Response`.
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly details: string | string[];
  readonly field?: string;

  constructor(
    statusCode: number,
    message: string | string[],
    field?: string,
  ) {
    super(Array.isArray(message) ? message.join('; ') : message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = message;
    this.field = field;
  }

  toBody(): ErrorBody {
    return {
      statusCode: this.statusCode,
      error: ERROR_NAMES[this.statusCode] ?? 'Error',
      message: this.details,
      ...(this.field !== undefined && { field: this.field }),
    };
  }
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
export function toHttpError(
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
        statusCode: 409,
        error: 'Conflict',
        message: field
          ? `Ya existe un registro con ese valor en "${field}"`
          : 'Ya existe un registro con ese valor único',
        field,
      };
    }
    case 'P2003':
      return {
        statusCode: 409,
        error: 'Conflict',
        message:
          'El registro referenciado no existe o todavía tiene registros dependientes',
      };
    case 'P2025':
      return {
        statusCode: 404,
        error: 'Not Found',
        message: 'Registro no encontrado',
      };
    case 'P2011':
    case 'P2014':
      return {
        statusCode: 400,
        error: 'Bad Request',
        message: 'Falta un campo obligatorio o una relación requerida',
      };
    default:
      return null;
  }
}

function internalErrorResponse(): Response {
  return Response.json(
    {
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Error interno del servidor',
    } satisfies ErrorBody,
    { status: 500 },
  );
}

/** Maps any thrown value to the JSON error response used by every route. */
export function apiErrorResponse(exception: unknown): Response {
  if (exception instanceof ApiError) {
    return Response.json(exception.toBody(), { status: exception.statusCode });
  }

  if (exception instanceof Prisma.PrismaClientKnownRequestError) {
    const body = toHttpError(exception);
    if (body) {
      return Response.json(body, { status: body.statusCode });
    }

    console.error(
      `Unhandled Prisma error ${exception.code}: ${exception.message}`,
    );
    return internalErrorResponse();
  }

  console.error(exception);
  return internalErrorResponse();
}
