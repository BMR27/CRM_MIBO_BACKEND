-- ===================================================
-- Migración: Branding por espacio de trabajo (tenant)
-- Fecha: 2026-11-13
-- ===================================================

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS branding_logo_url VARCHAR(500);

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS branding_accent_color VARCHAR(20);

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS branding_display_name VARCHAR(200);
