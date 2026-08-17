"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantScopedRepositoryProvider = tenantScopedRepositoryProvider;
const typeorm_1 = require("@nestjs/typeorm");
const tenant_scoped_repository_1 = require("./tenant-scoped.repository");
/**
 * Crea un provider `{ provide: token, useFactory: ... }` que expone un TenantScopedRepository<T>
 * envolviendo el Repository<T> ya registrado por TypeOrmModule.forFeature([Entity]) en el módulo.
 */
function tenantScopedRepositoryProvider(token, entity) {
    return {
        provide: token,
        useFactory: (repo) => new tenant_scoped_repository_1.TenantScopedRepository(repo),
        inject: [(0, typeorm_1.getRepositoryToken)(entity)],
    };
}
//# sourceMappingURL=tenant-scoped-repository.provider.js.map