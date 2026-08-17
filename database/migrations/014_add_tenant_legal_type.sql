-- ===================================================
-- Migración: Agregar tipo de persona (física/moral) al tenant
-- Fecha: 2026-08-16
-- ===================================================

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS legal_type VARCHAR(10) NOT NULL DEFAULT 'fisica'
  CHECK (legal_type IN ('fisica', 'moral'));

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS tax_id VARCHAR(20);

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS legal_name VARCHAR(255);
