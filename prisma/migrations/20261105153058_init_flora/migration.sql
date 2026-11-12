-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "estado_flora" AS ENUM ('vivo', 'enfermo', 'muerto', 'talado');

-- CreateTable
CREATE TABLE "familia" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "familia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "especie" (
    "id" SERIAL NOT NULL,
    "familia_id" INTEGER NOT NULL,
    "nombre_cientifico" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "especie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planta" (
    "id" SERIAL NOT NULL,
    "especie_id" INTEGER NOT NULL,
    "nombre_comun" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "img_url" VARCHAR(500),

    CONSTRAINT "planta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flora" (
    "id" INTEGER NOT NULL,
    "planta_id" INTEGER NOT NULL,
    "latitud" DECIMAL(9,6) NOT NULL,
    "longitud" DECIMAL(9,6) NOT NULL,
    "img_url" VARCHAR(500),
    "estado" "estado_flora" NOT NULL DEFAULT 'vivo',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flora_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "familia_nombre_key" ON "familia"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "especie_nombre_cientifico_key" ON "especie"("nombre_cientifico");

-- CreateIndex
CREATE INDEX "especie_familia_id_idx" ON "especie"("familia_id");

-- CreateIndex
CREATE INDEX "planta_especie_id_idx" ON "planta"("especie_id");

-- CreateIndex
CREATE INDEX "flora_planta_id_idx" ON "flora"("planta_id");

-- AddForeignKey
ALTER TABLE "especie" ADD CONSTRAINT "especie_familia_id_fkey" FOREIGN KEY ("familia_id") REFERENCES "familia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planta" ADD CONSTRAINT "planta_especie_id_fkey" FOREIGN KEY ("especie_id") REFERENCES "especie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flora" ADD CONSTRAINT "flora_planta_id_fkey" FOREIGN KEY ("planta_id") REFERENCES "planta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Enable Row Level Security. These tables are reachable through PostgREST, so
-- without RLS the publishable (anon) key would have full access to them.
-- Prisma connects as the database owner and bypasses RLS; add policies before
-- reading/writing these tables through the Supabase client.
ALTER TABLE "familia" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "especie" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "planta" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "flora" ENABLE ROW LEVEL SECURITY;
