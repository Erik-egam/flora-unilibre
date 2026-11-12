import { z } from 'zod';
import { ApiError } from './errors';

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

export function noContent(): Response {
  return new Response(null, { status: 204 });
}

/**
 * Equivalent to Nest's `ParseIntPipe`: rejects non-numeric ids with `400` and
 * lets the service return `404` when the row does not exist.
 */
export function parseId(raw: string): number {
  if (!/^-?\d+$/.test(raw)) {
    throw new ApiError(400, 'Validation failed (numeric string is expected)');
  }

  return Number.parseInt(raw, 10);
}

function formatIssues(error: z.ZodError): string[] {
  return error.issues.flatMap((issue) => {
    const path = issue.path.join('.');

    if (issue.code === 'unrecognized_keys') {
      return issue.keys.map((key) => `property ${key} should not exist`);
    }

    return [path ? `${path} ${issue.message}` : issue.message];
  });
}

function parseSchema<T>(input: unknown, schema: z.ZodType<T>): T {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new ApiError(400, formatIssues(result.error));
  }

  return result.data;
}

export async function parseJson<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<T> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    throw new ApiError(400, 'Invalid JSON body');
  }

  return parseSchema(payload, schema);
}

export function parseQuery<T>(request: Request, schema: z.ZodType<T>): T {
  const { searchParams } = new URL(request.url);
  const query: Record<string, string> = {};

  for (const [key, value] of searchParams) {
    query[key] = value;
  }

  return parseSchema(query, schema);
}
