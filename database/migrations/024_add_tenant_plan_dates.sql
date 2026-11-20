-- ===================================================
-- Migración: Vigencia del plan del espacio de trabajo
-- Fecha: 2026-11-19
--
-- El plan (tenants.plan) no tenía fechas. plan_started_at y plan_expires_at permiten
-- mostrar en el resumen general cuándo vence la suscripción. Ambas son opcionales:
-- un tenant sin fechas (p. ej. el plan free) simplemente no muestra vencimiento.
-- ===================================================

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMPTZ;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;
