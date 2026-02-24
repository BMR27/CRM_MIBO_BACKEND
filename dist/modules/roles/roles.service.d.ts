import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
export declare class RolesService {
    private rolesRepository;
    constructor(rolesRepository: Repository<Role>);
    findAll(): Promise<Role[]>;
    findById(id: string): Promise<Role>;
    findByName(name: string): Promise<Role>;
    create(data: Partial<Role>): Promise<Role>;
    update(id: string, data: Partial<Role>): Promise<Role>;
    delete(id: string): Promise<void>;
    seedDefaultRoles(): Promise<void>;
}
//# sourceMappingURL=roles.service.d.ts.map