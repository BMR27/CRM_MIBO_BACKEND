import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class PlatformAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (request.user?.isPlatformAdmin !== true) {
      throw new ForbiddenException('Esta acción requiere permisos de super-admin de plataforma');
    }
    return true;
  }
}
