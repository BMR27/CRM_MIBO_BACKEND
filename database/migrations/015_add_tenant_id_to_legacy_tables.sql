-- ===================================================
-- Migración: Agregar tenant_id a tablas legacy del frontend
-- (calls, bulk_campaigns, webhook_logs) que quedaron sin
-- aislamiento multi-tenant. Todo lo existente pertenece al
-- tenant original "Hilo Central".
-- Fecha: 2026-08-23
-- ===================================================

ALTER TABLE calls ADD COLUMN IF NOT EXISTS tenant_id UUID;
UPDATE calls SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE calls ALTER COLUMN tenant_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_calls_tenant_id ON calls(tenant_id);

ALTER TABLE bulk_campaigns ADD COLUMN IF NOT EXISTS tenant_id UUID;
UPDATE bulk_campaigns SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE bulk_campaigns ALTER COLUMN tenant_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bulk_campaigns_tenant_id ON bulk_campaigns(tenant_id);

ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS tenant_id UUID;
UPDATE webhook_logs SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_webhook_logs_tenant_id ON webhook_logs(tenant_id);
