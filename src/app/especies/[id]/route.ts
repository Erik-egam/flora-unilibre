import { apiErrorResponse } from '@/lib/errors';
import { json, noContent, parseId, parseJson } from '@/lib/http';
import { getEspecieService } from '@/modules/especie';
import { updateEspecieSchema } from '@/modules/especie/especie.schemas';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: Request,
  { params }: RouteContext,
): Promise<Response> {
  try {
    const { id } = await params;
    return json(await getEspecieService().findOne(parseId(id)));
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
    const dto = await parseJson(request, updateEspecieSchema);
    return json(await getEspecieService().update(parseId(id), dto));
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
    await getEspecieService().remove(parseId(id));
    return noContent();
  } catch (error) {
    return apiErrorResponse(error);
  }
}
