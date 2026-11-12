import { describe, expect, it } from 'vitest';
import { parseEnv } from './env';

const validEnv = {
  SUPABASE_URL: 'https://project-ref.supabase.co',
  SUPABASE_ANON_KEY: 'anon-key',
  DATABASE_URL:
    'postgresql://postgres.project-ref:secret@aws-0-eu-west-3.pooler.supabase.com:6543/postgres',
};

describe('parseEnv', () => {
  it('accepts a valid configuration', () => {
    expect(parseEnv(validEnv)).toMatchObject(validEnv);
  });

  it('accepts the local Supabase stack URLs', () => {
    expect(() =>
      parseEnv({
        ...validEnv,
        SUPABASE_URL: 'http://127.0.0.1:54321',
        DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
        DIRECT_URL: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
      }),
    ).not.toThrow();
  });

  it('trims surrounding whitespace', () => {
    expect(
      parseEnv({ ...validEnv, SUPABASE_ANON_KEY: '  anon-key  ' }),
    ).toMatchObject({ SUPABASE_ANON_KEY: 'anon-key' });
  });

  it('requires the Supabase URL', () => {
    expect(() => parseEnv({ ...validEnv, SUPABASE_URL: undefined })).toThrow(
      /SUPABASE_URL is required/,
    );
  });

  it('requires the anon key', () => {
    expect(() =>
      parseEnv({ ...validEnv, SUPABASE_ANON_KEY: undefined }),
    ).toThrow(/SUPABASE_ANON_KEY is required/);
  });

  it('requires the database URL', () => {
    expect(() => parseEnv({ ...validEnv, DATABASE_URL: undefined })).toThrow(
      /DATABASE_URL is required/,
    );
  });

  it('rejects a malformed Supabase URL', () => {
    expect(() =>
      parseEnv({ ...validEnv, SUPABASE_URL: 'not-a-url' }),
    ).toThrow(/SUPABASE_URL must be a valid URL/);
  });

  it('rejects a non-http Supabase URL', () => {
    expect(() =>
      parseEnv({
        ...validEnv,
        SUPABASE_URL: 'ftp://project-ref.supabase.co',
      }),
    ).toThrow(/must use the http or https protocol/);
  });

  it('rejects a non-PostgreSQL database URL', () => {
    expect(() =>
      parseEnv({ ...validEnv, DATABASE_URL: 'mysql://localhost:3306/db' }),
    ).toThrow(/DATABASE_URL must be a PostgreSQL connection string/);
  });

  it('treats the direct and service role URLs as optional', () => {
    expect(() => parseEnv(validEnv)).not.toThrow();
  });

  it('treats an empty optional variable as not set', () => {
    const env = parseEnv({
      ...validEnv,
      SUPABASE_SERVICE_ROLE_KEY: '   ',
      DIRECT_URL: '',
    });

    expect(env).not.toHaveProperty('SUPABASE_SERVICE_ROLE_KEY');
    expect(env).not.toHaveProperty('DIRECT_URL');
  });

  it('validates the direct URL when present', () => {
    expect(() =>
      parseEnv({ ...validEnv, DIRECT_URL: 'http://127.0.0.1:54322' }),
    ).toThrow(/DIRECT_URL must be a PostgreSQL connection string/);
  });
});
