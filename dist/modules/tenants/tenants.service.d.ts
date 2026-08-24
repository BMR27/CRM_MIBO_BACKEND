import { EntityManager, Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
export declare class TenantsService {
    private tenantsRepository;
    constructor(tenantsRepository: Repository<Tenant>);
    findById(id: string): Promise<Tenant | null>;
    findBySlug(slug: string): Promise<Tenant | null>;
    generateUniqueSlug(name: string, manager?: EntityManager): Promise<string>;
    createTenant(data: {
        name: string;
        contact_email?: string;
        legal_type?: 'fisica' | 'moral';
        tax_id?: string;
        legal_name?: string;
    }, manager: EntityManager): Promise<Tenant>;
    renameTenant(id: string, name: string): Promise<Tenant>;
    updateFeatureFlags(id: string, flags: {
        bulk_messaging_enabled?: boolean;
        wa_templates_enabled?: boolean;
    }): Promise<Tenant>;
}
//# sourceMappingURL=tenants.service.d.ts.map