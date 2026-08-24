-- ===================================================
-- Migración: Agregar flag de super-admin de plataforma
-- Fecha: 2026-08-24
-- ===================================================

ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN NOT NULL DEFAULT false;
