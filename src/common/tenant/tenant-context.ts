import { AsyncLocalStorage } from 'async_hooks';
import { InternalServerErrorException } from '@nestjs/common';

export const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export interface TenantContextData {
  tenantId: string;
  userId?: string;
  role?: string;
}

export class TenantContext {
  private static als = new AsyncLocalStorage<TenantContextData>();

  static run<T>(data: TenantContextData, fn: () => T): T {
    return this.als.run(data, fn);
  }

  static get(): TenantContextData | undefined {
    return this.als.getStore();
  }

  static getTenantId(): string {
    const store = this.als.getStore();
    if (!store?.tenantId) {
      throw new InternalServerErrorException(
        'TenantContext no inicializado: ninguna solicitud debería llegar al service layer sin tenant resuelto',
      );
    }
    return store.tenantId;
  }
}
