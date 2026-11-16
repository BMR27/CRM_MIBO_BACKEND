-- ===================================================
-- Migración: Módulos opcionales por tenant + logo subido como archivo
-- Fecha: 2026-11-16
-- ===================================================

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS module_citas_enabled BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS module_agentes_enabled BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS module_leads_enabled BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS module_docs_api_enabled BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS branding_logo_data BYTEA;

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS branding_logo_mime VARCHAR(100);

-- Los tenants que ya existían antes de esta migración seguían usando estos módulos
-- libremente (no eran opcionales); se mantienen habilitados para no romper su uso.
-- Los tenants nuevos (como Relivital) arrancan con todo deshabilitado hasta que un
-- super-admin de plataforma los habilite explícitamente.
UPDATE tenants
SET module_citas_enabled = true,
    module_agentes_enabled = true,
    module_leads_enabled = true,
    module_docs_api_enabled = true
WHERE id <> '0b50210b-d7d0-47df-8fe1-71ce95b419e6';
