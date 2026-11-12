import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ApiError } from './errors';
import { json, noContent, parseId, parseJson, parseQuery } from './http';

const schema = z.strictObject({
  nombre: z.string().min(1),
  limite: z.coerce.number().int().optional(),
});

function post(body: string): Request {
  return new Request('http://localhost/familias', {
    method: 'POST',
    body,
    headers: { 'content-type': 'application/json' },
  });
}

describe('json', () => {
  it('serializes a body with the given status', async () => {
    const response = json({ ok: true }, 201);

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it('builds an empty 204 response', async () => {
    const response = noContent();

    expect(response.status).toBe(204);
    await expect(response.text()).resolves.toBe('');
  });
});

describe('parseId', () => {
  it('parses numeric ids', () => {
    expect(parseId('50')).toBe(50);
    expect(parseId('-1')).toBe(-1);
  });

  it('rejects non-numeric ids with a 400 ApiError', () => {
    expect(() => parseId('abc')).toThrow(ApiError);
    expect(() => parseId('abc')).toThrow(
      /Validation failed \(numeric string is expected\)/,
    );
  });
});

describe('parseJson', () => {
  it('parses a valid body', async () => {
    await expect(
      parseJson(post('{"nombre":"Myrtaceae"}'), schema),
    ).resolves.toEqual({ nombre: 'Myrtaceae' });
  });

  it('rejects invalid JSON with a 400 ApiError', async () => {
    await expect(parseJson(post('{oops'), schema)).rejects.toMatchObject({
      statusCode: 400,
      message: 'Invalid JSON body',
    });
  });

  it('rejects unknown fields with property messages', async () => {
    await expect(
      parseJson(post('{"nombre":"X","id":1}'), schema),
    ).rejects.toMatchObject({
      statusCode: 400,
      details: ['property id should not exist'],
    });
  });

  it('rejects missing required fields', async () => {
    await expect(parseJson(post('{}'), schema)).rejects.toMatchObject({
      statusCode: 400,
      details: [expect.stringMatching(/^nombre /)],
    });
  });
});

describe('parseQuery', () => {
  it('parses and coerces query parameters', () => {
    const request = new Request(
      'http://localhost/familias?nombre=Myrtaceae&limite=5',
    );

    expect(parseQuery(request, schema)).toEqual({
      nombre: 'Myrtaceae',
      limite: 5,
    });
  });

  it('rejects unknown query parameters', () => {
    const request = new Request('http://localhost/familias?foo=bar');

    expect(() => parseQuery(request, schema)).toThrow(ApiError);
  });
});
