import { describe, expect, it } from 'vitest';
import { paginationSchema } from '@/lib/pagination';
import {
  createFamiliaSchema,
  listFamiliasQuerySchema,
  updateFamiliaSchema,
} from '@/modules/familia/familia.schemas';
import {
  createEspecieSchema,
  listEspeciesQuerySchema,
} from '@/modules/especie/especie.schemas';
import {
  createPlantaSchema,
  listPlantasQuerySchema,
} from '@/modules/planta/planta.schemas';
import {
  createFloraSchema,
  listFloraQuerySchema,
  updateFloraSchema,
} from '@/modules/flora/flora.schemas';

describe('paginationSchema', () => {
  it('applies the default limit and offset', () => {
    expect(paginationSchema.parse({})).toEqual({ limit: 20, offset: 0 });
  });

  it('coerces query strings to numbers', () => {
    expect(paginationSchema.parse({ limit: '5', offset: '10' })).toEqual({
      limit: 5,
      offset: 10,
    });
  });

  it('caps limit at 100 and rejects zero', () => {
    expect(paginationSchema.safeParse({ limit: 101 }).success).toBe(false);
    expect(paginationSchema.safeParse({ limit: 0 }).success).toBe(false);
    expect(paginationSchema.safeParse({ offset: -1 }).success).toBe(false);
  });

  it('rejects unknown query parameters', () => {
    expect(paginationSchema.safeParse({ foo: 'bar' }).success).toBe(false);
  });
});

describe('familia schemas', () => {
  it('accepts a nombre and an omitted description', () => {
    expect(createFamiliaSchema.parse({ nombre: 'Myrtaceae' })).toEqual({
      nombre: 'Myrtaceae',
    });
  });

  it('accepts an explicit null description', () => {
    expect(
      createFamiliaSchema.parse({ nombre: 'Myrtaceae', descripcion: null }),
    ).toEqual({ nombre: 'Myrtaceae', descripcion: null });
  });

  it('rejects an empty nombre and unknown fields', () => {
    expect(createFamiliaSchema.safeParse({ nombre: '' }).success).toBe(false);
    expect(
      createFamiliaSchema.safeParse({ nombre: 'X', id: 1 }).success,
    ).toBe(false);
  });

  it('accepts partial updates and rejects unknown fields', () => {
    expect(updateFamiliaSchema.parse({ descripcion: 'x' })).toEqual({
      descripcion: 'x',
    });
    expect(updateFamiliaSchema.safeParse({ id: 1 }).success).toBe(false);
  });

  it('parses list filters', () => {
    expect(
      listFamiliasQuerySchema.parse({ q: 'myr', limit: '5' }),
    ).toEqual({ limit: 5, offset: 0, q: 'myr' });
    expect(listFamiliasQuerySchema.safeParse({ foo: 'x' }).success).toBe(false);
  });
});

describe('especie schemas', () => {
  it('coerces familiaId and keeps optional fields', () => {
    expect(
      createEspecieSchema.parse({
        familiaId: '1',
        nombreCientifico: 'Eucalyptus grandis',
      }),
    ).toEqual({ familiaId: 1, nombreCientifico: 'Eucalyptus grandis' });
  });

  it('requires a positive familiaId', () => {
    expect(
      createEspecieSchema.safeParse({
        familiaId: 0,
        nombreCientifico: 'X',
      }).success,
    ).toBe(false);
  });

  it('parses the familiaId and q filters', () => {
    expect(
      listEspeciesQuerySchema.parse({ familiaId: '2', q: 'euc' }),
    ).toEqual({ limit: 20, offset: 0, familiaId: 2, q: 'euc' });
  });
});

describe('planta schemas', () => {
  it('accepts a valid image URL', () => {
    expect(
      createPlantaSchema.parse({
        especieId: '1',
        nombreComun: 'Eucalipto',
        imgUrl: 'https://example.com/eucalipto.jpg',
      }),
    ).toEqual({
      especieId: 1,
      nombreComun: 'Eucalipto',
      imgUrl: 'https://example.com/eucalipto.jpg',
    });
  });

  it('rejects an invalid image URL', () => {
    expect(
      createPlantaSchema.safeParse({
        especieId: 1,
        nombreComun: 'Eucalipto',
        imgUrl: 'not-a-url',
      }).success,
    ).toBe(false);
  });

  it('parses the especieId filter', () => {
    expect(listPlantasQuerySchema.parse({ especieId: '3' })).toEqual({
      limit: 20,
      offset: 0,
      especieId: 3,
    });
  });
});

describe('flora schemas', () => {
  const valid = {
    id: '50',
    plantaId: '2',
    latitud: '4.60971',
    longitud: '-74.08175',
  };

  it('coerces the plate number and coordinates', () => {
    expect(createFloraSchema.parse(valid)).toEqual({
      id: 50,
      plantaId: 2,
      latitud: 4.60971,
      longitud: -74.08175,
    });
  });

  it('accepts a valid estado', () => {
    expect(createFloraSchema.parse({ ...valid, estado: 'enfermo' })).toEqual({
      id: 50,
      plantaId: 2,
      latitud: 4.60971,
      longitud: -74.08175,
      estado: 'enfermo',
    });
  });

  it('rejects an unknown estado', () => {
    expect(
      createFloraSchema.safeParse({ ...valid, estado: 'desconocido' }).success,
    ).toBe(false);
  });

  it('rejects out-of-range and overly precise coordinates', () => {
    expect(createFloraSchema.safeParse({ ...valid, latitud: 91 }).success).toBe(
      false,
    );
    expect(
      createFloraSchema.safeParse({ ...valid, longitud: 181 }).success,
    ).toBe(false);
    expect(
      createFloraSchema.safeParse({ ...valid, latitud: 4.6097101 }).success,
    ).toBe(false);
  });

  it('does not allow patching the immutable plate number', () => {
    expect(updateFloraSchema.safeParse({ id: 50 }).success).toBe(false);
    expect(updateFloraSchema.parse({ estado: 'muerto' })).toEqual({
      estado: 'muerto',
    });
  });

  it('parses list filters', () => {
    expect(
      listFloraQuerySchema.parse({ plantaId: '2', estado: 'vivo' }),
    ).toEqual({ limit: 20, offset: 0, plantaId: 2, estado: 'vivo' });
    expect(listFloraQuerySchema.safeParse({ estado: 'x' }).success).toBe(false);
  });
});
