import { CanActivate, ExecutionContext } from '@nestjs/common';
/**
 * Protege endpoints internos (llamados servicio-a-servicio, p.ej. desde el frontend)
 * con un secreto compartido en el header `x-internal-secret`. Si INTERNAL_WEBHOOK_SECRET
 * no está configurada, deniega todo (fail closed) en vez de dejar el endpoint abierto.
 */
export declare class InternalSecretGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
//# sourceMappingURL=internal-secret.guard.d.ts.map