import { apiErrorResponse } from '@/lib/errors';
import { json, parseJson, parseQuery } from '@/lib/http';
import { getEspecieService } from '@/modules/especie';
import {
  createEspecieSchema,
  listEspeciesQuerySchema,
} from '@/modules/especie/especie.schemas';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  try {
    const query = parseQuery(request, listEspeciesQuerySchema);
    return json(await getEspecieService().findAll(query));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const dto = await parseJson(request, createEspecieSchema);
    return json(await getEspecieService().create(dto), 201);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
