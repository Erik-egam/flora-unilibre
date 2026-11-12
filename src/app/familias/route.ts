import { apiErrorResponse } from '@/lib/errors';
import { json, parseJson, parseQuery } from '@/lib/http';
import { getFamiliaService } from '@/modules/familia';
import {
  createFamiliaSchema,
  listFamiliasQuerySchema,
} from '@/modules/familia/familia.schemas';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  try {
    const query = parseQuery(request, listFamiliasQuerySchema);
    return json(await getFamiliaService().findAll(query));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const dto = await parseJson(request, createFamiliaSchema);
    return json(await getFamiliaService().create(dto), 201);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
