import { z } from 'zod';
import { paginationSchema } from '@/lib/pagination';

export const createPlantaSchema = z.strictObject({
  /** Parent `especie.id`. */
  especieId: z.coerce.number().int().min(1),
  /** Ej: Eucalipto. */
  nombreComun: z.string().max(100).min(1),
  descripcion: z.string().max(5000).nullish(),
  imgUrl: z.string().url().max(500).nullish(),
});

export const updatePlantaSchema = createPlantaSchema.partial();

export const listPlantasQuerySchema = paginationSchema.extend({
  /** Only plants of this species. */
  especieId: z.coerce.number().int().min(1).optional(),
  /** Case-insensitive search over `nombreComun`. */
  q: z.string().max(100).optional(),
});

export type CreatePlantaInput = z.infer<typeof createPlantaSchema>;
export type UpdatePlantaInput = z.infer<typeof updatePlantaSchema>;
export type ListPlantasQuery = z.infer<typeof listPlantasQuerySchema>;
