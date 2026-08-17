import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DEFAULT_TENANT_ID, TenantContext } from './tenant-context';

/**
 * Resuelve el tenant de la request (JWT o API key, ambos dejan `req.user.tenantId`) y lo publica
 * en TenantContext para todo el service layer de esta request.
 *
 * Las rutas públicas/sin autenticar (webhooks de WhatsApp/Twilio, health checks) no tienen
 * `req.user`, así que caen al tenant `default`: esto preserva el comportamiento actual de esos
 * canales (single-tenant) hasta que exista enrutamiento real por canal/tenant (fuera de alcance
 * de esta fase — cada tenant tendría que tener su propio WABA/número, algo no contemplado hoy).
 */
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const tenantId: string = req.user?.tenantId || DEFAULT_TENANT_ID;

    return new Observable((subscriber) => {
      TenantContext.run(
        { tenantId, userId: req.user?.id, role: req.user?.role },
        () => {
          next.handle().subscribe({
            next: (value) => subscriber.next(value),
            error: (err) => subscriber.error(err),
            complete: () => subscriber.complete(),
          });
        },
      );
    });
  }
}
