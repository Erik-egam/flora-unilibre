import { Prisma } from '@/generated/prisma/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiErrorResponse, toHttpError } from './errors';

function prismaError(code: string, meta?: Record<string, unknown>) {
  return new Prisma.PrismaClientKnownRequestError('boom', {
    code,
    clientVersion: '7.10.1',
    meta,
  });
}

describe('toHttpError', () => {
  it('maps a unique violation to 409 with the offending field', () => {
    expect(toHttpError(prismaError('P2002', { target: ['nombre'] }))).toEqual(
      expect.objectContaining({ statusCode: 409, field: 'nombre' }),
    );
  });

  it('maps a foreign key violation to 409', () => {
    expect(toHttpError(prismaError('P2003'))).toEqual(
      expect.objectContaining({ statusCode: 409 }),
    );
  });

  it('maps a missing record on write to 404', () => {
    expect(toHttpError(prismaError('P2025'))).toEqual(
      expect.objectContaining({ statusCode: 404 }),
    );
  });

  it('maps null/relation violations to 400', () => {
    expect(toHttpError(prismaError('P2011'))).toEqual(
      expect.objectContaining({ statusCode: 400 }),
    );
    expect(toHttpError(prismaError('P2014'))).toEqual(
      expect.objectContaining({ statusCode: 400 }),
    );
  });

  it('returns null for unknown codes', () => {
    expect(toHttpError(prismaError('P9999'))).toBeNull();
  });
});

describe('apiErrorResponse', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('serializes an ApiError with its status and body', async () => {
    const response = apiErrorResponse(
      new ApiError(404, 'Familia 99 no encontrada'),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Familia 99 no encontrada',
    });
  });

  it('serializes validation messages as an array', async () => {
    const response = apiErrorResponse(
      new ApiError(400, ['nombre is required']),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ message: ['nombre is required'] }),
    );
  });

  it('maps known Prisma errors', async () => {
    const response = apiErrorResponse(prismaError('P2002', { target: ['nombre'] }));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ field: 'nombre' }),
    );
  });

  it('keeps a generic 500 for unknown codes', async () => {
    const response = apiErrorResponse(prismaError('P9999'));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Error interno del servidor',
    });
  });

  it('keeps a generic 500 for unexpected errors', async () => {
    const response = apiErrorResponse(new Error('boom'));

    expect(response.status).toBe(500);
  });
});
