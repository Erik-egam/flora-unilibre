import { getPrisma } from '@/lib/prisma';
import { FloraRepository } from './flora.repository';
import { FloraService } from './flora.service';

let service: FloraService | undefined;

/** Composition root for the module: one service per process. */
export function getFloraService(): FloraService {
  service ??= new FloraService(new FloraRepository(getPrisma()));
  return service;
}

export { FloraRepository, FloraService };
