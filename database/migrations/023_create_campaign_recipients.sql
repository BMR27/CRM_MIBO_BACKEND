-- ===================================================
-- Migración: Bitácora propia de destinatarios por campaña
-- Fecha: 2026-11-16
--
-- Hasta ahora el detalle de una campaña se reconstruía leyendo los mensajes con
-- metadata.source = 'bulk'. Eso tenía dos agujeros:
--   1. Borrar la conversación (o el contacto) borraba en cascada esos mensajes, y con
--      ellos el único rastro de a quién se le envió la campaña.
--   2. Los envíos que fallaban nunca llegaban a escribir un mensaje, así que no
--      quedaban registrados en ninguna parte: la campaña decía "N fallidos" sin poder
--      decir quiénes.
--
-- Esta tabla guarda una fila por destinatario, con éxito o error, y a propósito NO
-- tiene llaves foráneas a contacts/conversations: la bitácora debe sobrevivir a que
-- esos registros se borren.
-- ===================================================

CREATE TABLE IF NOT EXISTS campaign_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  campaign_id VARCHAR(128) NOT NULL,
  campaign_code VARCHAR(128),
  campaign_name VARCHAR(255),
  template_sid VARCHAR(128),
  template_name VARCHAR(255),
  contact_id UUID,
  conversation_id UUID,
  contact_name VARCHAR(255),
  phone_number VARCHAR(64),
  status VARCHAR(20) NOT NULL DEFAULT 'sent',
  error TEXT,
  message_sid VARCHAR(128),
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign
  ON campaign_recipients (tenant_id, campaign_id);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_code
  ON campaign_recipients (tenant_id, campaign_code);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_created
  ON campaign_recipients (created_at DESC);
