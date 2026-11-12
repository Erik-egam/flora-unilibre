import { json } from '@/lib/http';

export const runtime = 'nodejs';

/**
 * Unknown routes answer with the same JSON shape Nest used, instead of Next's
 * HTML 404 page. Static routes (`/familias`, ...) always win over this segment.
 */
function notFound(request: Request): Response {
  const { pathname } = new URL(request.url);

  return json(
    {
      message: `Cannot ${request.method} ${pathname}`,
      error: 'Not Found',
      statusCode: 404,
    },
    404,
  );
}

export const GET = notFound;
export const POST = notFound;
export const PUT = notFound;
export const PATCH = notFound;
export const DELETE = notFound;
