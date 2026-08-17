-- Migración: endurece tenant_id a NOT NULL en todas las tablas multi-tenant, ahora que el
-- backfill de las migraciones 009 y 011 está confirmado (0 filas con tenant_id NULL).

BEGIN;

ALTER TABLE users ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE roles ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE contacts ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE conversations ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE messages ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE orders ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE macros ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE conversation_tags ALTER COLUMN tenant_id SET NOT NULL;

COMMIT;
