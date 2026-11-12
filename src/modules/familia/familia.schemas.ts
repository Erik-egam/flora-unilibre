import { z } from 'zod';
import { paginationSchema } from '@/lib/pagination';

export const createFamiliaSchema = z.strictObject({
  /** Ej: Myrtaceae. */
  nombre: z.string().max(100).min(1),
  descripcion: z.string().max(5000).nullish(),
});

export const updateFamiliaSchema = createFamiliaSchema.partial();

export const listFamiliasQuerySchema = paginationSchema.extend({
  /** Case-insensitive search over `nombre`. */
  q: z.string().max(100).optional(),
});

export type CreateFamiliaInput = z.infer<typeof createFamiliaSchema>;
export type UpdateFamiliaInput = z.infer<typeof updateFamiliaSchema>;
export type ListFamiliasQuery = z.infer<typeof listFamiliasQuerySchema>;
