import { apiErrorResponse } from '@/lib/errors';
import { json, parseJson, parseQuery } from '@/lib/http';
import { getPlantaService } from '@/modules/planta';
import {
  createPlantaSchema,
  listPlantasQuerySchema,
} from '@/modules/planta/planta.schemas';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  try {
    const query = parseQuery(request, listPlantasQuerySchema);
    return json(await getPlantaService().findAll(query));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const dto = await parseJson(request, createPlantaSchema);
    return json(await getPlantaService().create(dto), 201);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
