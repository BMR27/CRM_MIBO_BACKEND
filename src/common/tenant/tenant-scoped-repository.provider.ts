import { Provider, Type } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { TenantScopedRepository } from './tenant-scoped.repository';

/**
 * Crea un provider `{ provide: token, useFactory: ... }` que expone un TenantScopedRepository<T>
 * envolviendo el Repository<T> ya registrado por TypeOrmModule.forFeature([Entity]) en el módulo.
 */
export function tenantScopedRepositoryProvider<T extends ObjectLiteral>(
  token: string,
  entity: Type<T>,
): Provider {
  return {
    provide: token,
    useFactory: (repo: Repository<T>) => new TenantScopedRepository<T>(repo),
    inject: [getRepositoryToken(entity)],
  };
}
