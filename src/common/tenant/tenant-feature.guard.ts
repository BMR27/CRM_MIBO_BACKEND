import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantsService } from '../../modules/tenants/tenants.service';

export type TenantFeatureFlag = 'bulk_messaging_enabled' | 'wa_templates_enabled';

export const TENANT_FEATURE_KEY = 'tenantFeature';
export const RequireTenantFeature = (flag: TenantFeatureFlag) =>
  SetMetadata(TENANT_FEATURE_KEY, flag);

@Injectable()
export class TenantFeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tenantsService: TenantsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.get<TenantFeatureFlag>(
      TENANT_FEATURE_KEY,
      context.getHandler(),
    );

    if (!requiredFeature) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tenantId: string | undefined = request.user?.tenantId;

    if (!tenantId) {
      throw new ForbiddenException('No se pudo determinar el espacio de trabajo del usuario');
    }

    const tenant = await this.tenantsService.findById(tenantId);
    if (!tenant || !tenant[requiredFeature]) {
      throw new ForbiddenException('Esta función no está habilitada para tu espacio de trabajo');
    }

    return true;
  }
}
