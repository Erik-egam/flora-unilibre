import { apiErrorResponse } from '@/lib/errors';
import { json, parseJson, parseQuery } from '@/lib/http';
import { getFloraService } from '@/modules/flora';
import {
  createFloraSchema,
  listFloraQuerySchema,
} from '@/modules/flora/flora.schemas';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  try {
    const query = parseQuery(request, listFloraQuerySchema);
    return json(await getFloraService().findAll(query));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const dto = await parseJson(request, createFloraSchema);
    return json(await getFloraService().create(dto), 201);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
