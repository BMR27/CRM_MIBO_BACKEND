-- Migración: agrega tenant_id (+ backfill al tenant default) a las tablas de negocio y
-- convierte los UNIQUE globales de contacts.phone_number, orders.order_number y
-- macros.shortcut en compuestos (tenant_id, columna). tenant_id queda NULLABLE a nivel de
-- columna Postgres a propósito (mismo criterio que la migración 009).

BEGIN;

-- contacts
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE contacts SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
DO $$
DECLARE c RECORD;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'contacts'::regclass AND contype = 'u'
      AND pg_get_constraintdef(oid) = 'UNIQUE (phone_number)'
  LOOP
    EXECUTE format('ALTER TABLE contacts DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_tenant_phone_key;
ALTER TABLE contacts ADD CONSTRAINT contacts_tenant_phone_key UNIQUE (tenant_id, phone_number);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_id ON contacts(tenant_id);

-- conversations
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE conversations SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_id ON conversations(tenant_id);

-- messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE messages SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_tenant_id ON messages(tenant_id);

-- orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE orders SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
DO $$
DECLARE c RECORD;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'orders'::regclass AND contype = 'u'
      AND pg_get_constraintdef(oid) = 'UNIQUE (order_number)'
  LOOP
    EXECUTE format('ALTER TABLE orders DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_tenant_order_number_key;
ALTER TABLE orders ADD CONSTRAINT orders_tenant_order_number_key UNIQUE (tenant_id, order_number);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_id ON orders(tenant_id);

-- macros
ALTER TABLE macros ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE macros SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
DO $$
DECLARE c RECORD;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'macros'::regclass AND contype = 'u'
      AND pg_get_constraintdef(oid) = 'UNIQUE (shortcut)'
  LOOP
    EXECUTE format('ALTER TABLE macros DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;
ALTER TABLE macros DROP CONSTRAINT IF EXISTS macros_tenant_shortcut_key;
ALTER TABLE macros ADD CONSTRAINT macros_tenant_shortcut_key UNIQUE (tenant_id, shortcut);
CREATE INDEX IF NOT EXISTS idx_macros_tenant_id ON macros(tenant_id);

-- conversation_tags
ALTER TABLE conversation_tags ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE conversation_tags SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_conversation_tags_tenant_id ON conversation_tags(tenant_id);

COMMIT;
