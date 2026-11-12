import { z } from 'zod';
import { paginationSchema } from '@/lib/pagination';

export const createEspecieSchema = z.strictObject({
  /** Parent `familia.id`. */
  familiaId: z.coerce.number().int().min(1),
  /** Ej: Eucalyptus grandis W.Hill ex Maiden. */
  nombreCientifico: z.string().max(150).min(1),
  descripcion: z.string().max(5000).nullish(),
});

export const updateEspecieSchema = createEspecieSchema.partial();

export const listEspeciesQuerySchema = paginationSchema.extend({
  /** Only species of this family. */
  familiaId: z.coerce.number().int().min(1).optional(),
  /** Case-insensitive search over `nombreCientifico`. */
  q: z.string().max(150).optional(),
});

export type CreateEspecieInput = z.infer<typeof createEspecieSchema>;
export type UpdateEspecieInput = z.infer<typeof updateEspecieSchema>;
export type ListEspeciesQuery = z.infer<typeof listEspeciesQuerySchema>;
