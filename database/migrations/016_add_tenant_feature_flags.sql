-- ===================================================
-- Migración: Agregar feature flags de mensajería por tenant
-- Fecha: 2026-08-23
-- ===================================================

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS bulk_messaging_enabled BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS wa_templates_enabled BOOLEAN NOT NULL DEFAULT false;
