import { getPrisma } from '@/lib/prisma';
import { FamiliaRepository } from './familia.repository';
import { FamiliaService } from './familia.service';

let service: FamiliaService | undefined;

/** Composition root for the module: one service per process. */
export function getFamiliaService(): FamiliaService {
  service ??= new FamiliaService(new FamiliaRepository(getPrisma()));
  return service;
}

export { FamiliaRepository, FamiliaService };
