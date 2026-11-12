export const runtime = 'nodejs';

/** Kept for parity with the Nest app's root route. */
export function GET(): Response {
  return new Response('Hello World!');
}
