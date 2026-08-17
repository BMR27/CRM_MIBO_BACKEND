import { DeepPartial, FindManyOptions, FindOneOptions, ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
/**
 * Wrapper delgado sobre Repository<T> que agrega `tenant_id` a toda operación de lectura,
 * escritura y borrado. Se usa en lugar del Repository crudo en cualquier service que toque
 * datos de negocio (contacts, conversations, messages, orders, macros, conversation_tags).
 *
 * Requiere que TenantContext ya tenga un tenantId publicado (lo hace TenantInterceptor,
 * global, para toda request) — si no, lanza en vez de devolver/mutar datos de otro tenant.
 */
export declare class TenantScopedRepository<T extends ObjectLiteral & {
    tenant_id?: string;
}> {
    private readonly repo;
    constructor(repo: Repository<T>);
    private scope;
    get raw(): Repository<T>;
    private scopeWhere;
    find(options?: FindManyOptions<T>): Promise<T[]>;
    findOne(options: FindOneOptions<T>): Promise<T | null>;
    findOneBy(where: Partial<T>): Promise<T | null>;
    count(options?: FindManyOptions<T>): Promise<number>;
    create(data: DeepPartial<T>): T;
    save(entity: DeepPartial<T>): Promise<T>;
    update(id: string, data: DeepPartial<T>): Promise<void>;
    delete(id: string): Promise<void>;
    deleteBy(where: Partial<T>): Promise<void>;
    updateBy(where: Partial<T>, data: DeepPartial<T>): Promise<void>;
    increment(id: string, column: string, value: number): Promise<void>;
    createQueryBuilder(alias: string): SelectQueryBuilder<T>;
}
//# sourceMappingURL=tenant-scoped.repository.d.ts.map