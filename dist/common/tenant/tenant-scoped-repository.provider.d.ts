import { Provider, Type } from '@nestjs/common';
import { ObjectLiteral } from 'typeorm';
/**
 * Crea un provider `{ provide: token, useFactory: ... }` que expone un TenantScopedRepository<T>
 * envolviendo el Repository<T> ya registrado por TypeOrmModule.forFeature([Entity]) en el módulo.
 */
export declare function tenantScopedRepositoryProvider<T extends ObjectLiteral>(token: string, entity: Type<T>): Provider;
//# sourceMappingURL=tenant-scoped-repository.provider.d.ts.map