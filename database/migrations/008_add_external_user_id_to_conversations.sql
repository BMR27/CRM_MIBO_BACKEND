-- Migración: Agregar campo external_user_id a la tabla conversations
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS external_user_id VARCHAR(255);