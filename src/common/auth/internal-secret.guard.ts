import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

/**
 * Protege endpoints internos (llamados servicio-a-servicio, p.ej. desde el frontend)
 * con un secreto compartido en el header `x-internal-secret`. Si INTERNAL_WEBHOOK_SECRET
 * no está configurada, deniega todo (fail closed) en vez de dejar el endpoint abierto.
 */
@Injectable()
export class InternalSecretGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.INTERNAL_WEBHOOK_SECRET;
    if (!expected) {
      throw new UnauthorizedException('INTERNAL_WEBHOOK_SECRET no está configurada');
    }
    const request = context.switchToHttp().getRequest();
    const provided = request.headers['x-internal-secret'];
    if (provided !== expected) {
      throw new UnauthorizedException('Secreto interno inválido');
    }
    return true;
  }
}
