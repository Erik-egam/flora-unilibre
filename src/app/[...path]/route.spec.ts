import { describe, expect, it } from 'vitest';
import { GET, POST } from './route';

describe('unknown routes', () => {
  it('answers with the Nest-style JSON 404', async () => {
    const response = GET(
      new Request('http://localhost/no-existe', { method: 'GET' }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      message: 'Cannot GET /no-existe',
      error: 'Not Found',
      statusCode: 404,
    });
  });

  it('keeps the method in the message', async () => {
    const response = POST(
      new Request('http://localhost/no-existe', { method: 'POST' }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      message: 'Cannot POST /no-existe',
    });
  });
});
