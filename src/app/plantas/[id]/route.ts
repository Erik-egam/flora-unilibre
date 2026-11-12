import { apiErrorResponse } from '@/lib/errors';
import { json, noContent, parseId, parseJson } from '@/lib/http';
import { getPlantaService } from '@/modules/planta';
import { updatePlantaSchema } from '@/modules/planta/planta.schemas';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: Request,
  { params }: RouteContext,
): Promise<Response> {
  try {
    const { id } = await params;
    return json(await getPlantaService().findOne(parseId(id)));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteContext,
): Promise<Response> {
  try {
    const { id } = await params;
    const dto = await parseJson(request, updatePlantaSchema);
    return json(await getPlantaService().update(parseId(id), dto));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext,
): Promise<Response> {
  try {
    const { id } = await params;
    await getPlantaService().remove(parseId(id));
    return noContent();
  } catch (error) {
    return apiErrorResponse(error);
  }
}
