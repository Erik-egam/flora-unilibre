import { ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaExceptionFilter } from './prisma-exception.filter.js';

function createHost() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;

  return { host, status, json };
}

function prismaError(code: string, meta?: Record<string, unknown>) {
  return new Prisma.PrismaClientKnownRequestError('boom', {
    code,
    clientVersion: '7.10.1',
    meta,
  });
}

describe('PrismaExceptionFilter', () => {
  const filter = new PrismaExceptionFilter();

  beforeEach(() => {
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps a unique violation to 409 with the offending field', () => {
    const { host, status, json } = createHost();

    filter.catch(prismaError('P2002', { target: ['nombre'] }), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 409, field: 'nombre' }),
    );
  });

  it('maps a foreign key violation to 409', () => {
    const { host, status } = createHost();

    filter.catch(prismaError('P2003'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('maps a missing record on write to 404', () => {
    const { host, status } = createHost();

    filter.catch(prismaError('P2025'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });

  it('keeps a generic 500 for unknown codes', () => {
    const { host, status } = createHost();

    filter.catch(prismaError('P9999'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
