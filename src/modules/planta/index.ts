import { getPrisma } from '@/lib/prisma';
import { PlantaRepository } from './planta.repository';
import { PlantaService } from './planta.service';

let service: PlantaService | undefined;

/** Composition root for the module: one service per process. */
export function getPlantaService(): PlantaService {
  service ??= new PlantaService(new PlantaRepository(getPrisma()));
  return service;
}

export { PlantaRepository, PlantaService };
