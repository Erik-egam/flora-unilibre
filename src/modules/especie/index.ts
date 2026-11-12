import { getPrisma } from '@/lib/prisma';
import { EspecieRepository } from './especie.repository';
import { EspecieService } from './especie.service';

let service: EspecieService | undefined;

/** Composition root for the module: one service per process. */
export function getEspecieService(): EspecieService {
  service ??= new EspecieService(new EspecieRepository(getPrisma()));
  return service;
}

export { EspecieRepository, EspecieService };
