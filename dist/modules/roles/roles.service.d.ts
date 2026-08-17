import { EntityManager, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
export declare class RolesService {
    private rolesRepository;
    constructor(rolesRepository: Repository<Role>);
    findAll(tenantId: string): Promise<Role[]>;
    findById(id: string): Promise<Role>;
    findByNameForTenant(tenantId: string, name: string): Promise<Role>;
    create(data: Partial<Role>): Promise<Role>;
    update(id: string, data: Partial<Role>): Promise<Role>;
    delete(id: string): Promise<void>;
    private defaultRolesTemplate;
    /**
     * Siembra los 4 roles por defecto para un tenant específico.
     * Si se pasa un `manager` (ej. dentro de una transacción de signup-company), lo usa en vez del repo propio.
     */
    seedDefaultRolesForTenant(tenantId: string, manager?: EntityManager): Promise<void>;
}
//# sourceMappingURL=roles.service.d.ts.map