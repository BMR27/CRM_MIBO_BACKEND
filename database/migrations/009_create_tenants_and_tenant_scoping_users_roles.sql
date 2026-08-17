-- Migración: crea la tabla tenants y agrega tenant_id a roles/users.
-- Los usuarios y roles existentes se migran a un tenant "default" para no romper el CRM actual.
-- tenant_id se deja NULLABLE a nivel de columna a propósito (se endurece a NOT NULL en una
-- migración posterior, una vez confirmado el backfill en todos los entornos).

BEGIN;

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  contact_email VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'trial',
  plan VARCHAR(50) NOT NULL DEFAULT 'free',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

INSERT INTO tenants (id, name, slug, status, plan)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default', 'default', 'active', 'free')
ON CONFLICT (slug) DO NOTHING;

-- roles: tenant_id + unique compuesto (tenant_id, name)
ALTER TABLE roles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE roles SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_name_key;
ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_tenant_name_key;
-- Elimina el UNIQUE(name) global generado originalmente por TypeORM (nombre autogenerado,
-- no sigue la convención roles_name_key), cualquiera sea su nombre real.
DO $$
DECLARE
  c RECORD;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'roles'::regclass
      AND contype = 'u'
      AND pg_get_constraintdef(oid) = 'UNIQUE (name)'
  LOOP
    EXECUTE format('ALTER TABLE roles DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;
ALTER TABLE roles ADD CONSTRAINT roles_tenant_name_key UNIQUE (tenant_id, name);
CREATE INDEX IF NOT EXISTS idx_roles_tenant_id ON roles(tenant_id);

-- users: tenant_id + unique compuesto (tenant_id, email)
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE users SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_tenant_email_key;
-- Igual que arriba: elimina el UNIQUE(email) global generado originalmente por TypeORM.
DO $$
DECLARE
  c RECORD;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'users'::regclass
      AND contype = 'u'
      AND pg_get_constraintdef(oid) = 'UNIQUE (email)'
  LOOP
    EXECUTE format('ALTER TABLE users DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;
ALTER TABLE users ADD CONSTRAINT users_tenant_email_key UNIQUE (tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);

COMMIT;
