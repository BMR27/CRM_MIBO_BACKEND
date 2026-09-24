-- ===================================================
-- Migración: Webhooks salientes por tenant (eventos de estado de mensajes WhatsApp)
-- Fecha: 2026-09-01
-- ===================================================

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS webhook_url VARCHAR(500);

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS webhook_secret_encrypted TEXT;

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS webhook_events_enabled BOOLEAN NOT NULL DEFAULT false;
