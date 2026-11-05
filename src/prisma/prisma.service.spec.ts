import { ConfigService } from '@nestjs/config';
import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from './prisma.service.js';

function config(values: Record<string, string | undefined>): ConfigService {
  return { get: (key: string) => values[key] } as unknown as ConfigService;
}

const databaseUrl = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

describe('PrismaService', () => {
  it('creates a Prisma client from the environment', () => {
    const service = new PrismaService(config({ DATABASE_URL: databaseUrl }));

    expect(typeof service.$queryRaw).toBe('function');
    expect(typeof service.$transaction).toBe('function');
  });

  it('fails when the database URL is missing', () => {
    expect(() => new PrismaService(config({}))).toThrow(
      /DATABASE_URL is not configured/,
    );
  });

  it('disconnects when the module is destroyed', async () => {
    const service = new PrismaService(config({ DATABASE_URL: databaseUrl }));
    const disconnect = vi
      .spyOn(service, '$disconnect')
      .mockResolvedValue(undefined);

    await service.onModuleDestroy();

    expect(disconnect).toHaveBeenCalledOnce();
  });
});
