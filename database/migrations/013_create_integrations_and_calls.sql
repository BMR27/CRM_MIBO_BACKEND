-- Migración: tablas de configuración por tenant para WhatsApp, Facebook y Twilio Voice,
-- más el registro de llamadas (calls). Reemplazan las credenciales globales por variables
-- de entorno usadas hasta ahora.

BEGIN;

CREATE TABLE IF NOT EXISTS whatsapp_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id),
  provider VARCHAR(20) NOT NULL DEFAULT 'twilio',
  twilio_account_sid VARCHAR(255),
  twilio_auth_token_encrypted TEXT,
  twilio_whatsapp_number VARCHAR(50),
  cloud_access_token_encrypted TEXT,
  cloud_phone_number_id VARCHAR(255),
  cloud_waba_id VARCHAR(255),
  cloud_template_language VARCHAR(20) NOT NULL DEFAULT 'es_MX',
  verify_token VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS facebook_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id),
  page_id VARCHAR(255) NOT NULL,
  page_access_token_encrypted TEXT NOT NULL,
  verify_token VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_facebook_integrations_page_id ON facebook_integrations(page_id);

CREATE TABLE IF NOT EXISTS voice_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id),
  twilio_account_sid VARCHAR(255) NOT NULL,
  twilio_auth_token_encrypted TEXT NOT NULL,
  twilio_api_key_sid VARCHAR(255) NOT NULL,
  twilio_api_key_secret_encrypted TEXT NOT NULL,
  twiml_app_sid VARCHAR(255) NOT NULL,
  voice_number VARCHAR(50) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Nota: el nombre "calls" ya está tomado por una tabla del frontend (agendado de llamadas,
-- sin relación con telefonía real) que vive en la misma base de datos compartida. Se usa
-- "voice_calls" para el registro de llamadas de Twilio Voice y evitar el choque.
CREATE TABLE IF NOT EXISTS voice_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  conversation_id UUID REFERENCES conversations(id),
  contact_id UUID REFERENCES contacts(id),
  direction VARCHAR(10) NOT NULL,
  from_number VARCHAR(50),
  to_number VARCHAR(50),
  twilio_call_sid VARCHAR(255) UNIQUE,
  status VARCHAR(30) NOT NULL DEFAULT 'initiated',
  duration_seconds INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_voice_calls_tenant_id ON voice_calls(tenant_id);
CREATE INDEX IF NOT EXISTS idx_voice_calls_conversation_id ON voice_calls(conversation_id);

COMMIT;
