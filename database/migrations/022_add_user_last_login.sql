-- ===================================================
-- Migración: Registrar el último ingreso de cada usuario
-- Fecha: 2026-11-16
--
-- Alimenta el módulo de usuarios de plataforma (super-admin), que necesita
-- mostrar cuándo entró por última vez cada usuario y desde dónde.
-- Las columnas se escriben en el login del frontend (app/api/auth/login).
-- ===================================================

ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_login_ip TEXT;

-- El listado de plataforma ordena por último ingreso descendente.
CREATE INDEX IF NOT EXISTS idx_users_last_login_at
ON users (last_login_at DESC NULLS LAST);
