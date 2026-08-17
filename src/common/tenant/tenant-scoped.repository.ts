import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { TenantContext } from './tenant-context';

/**
 * Wrapper delgado sobre Repository<T> que agrega `tenant_id` a toda operación de lectura,
 * escritura y borrado. Se usa en lugar del Repository crudo en cualquier service que toque
 * datos de negocio (contacts, conversations, messages, orders, macros, conversation_tags).
 *
 * Requiere que TenantContext ya tenga un tenantId publicado (lo hace TenantInterceptor,
 * global, para toda request) — si no, lanza en vez de devolver/mutar datos de otro tenant.
 */
export class TenantScopedRepository<T extends ObjectLiteral & { tenant_id?: string }> {
  constructor(private readonly repo: Repository<T>) {}

  private scope(): Partial<T> {
    return { tenant_id: TenantContext.getTenantId() } as Partial<T>;
  }

  get raw(): Repository<T> {
    return this.repo;
  }

  private scopeWhere(where: FindManyOptions<T>['where']): any {
    const scope = this.scope();
    if (Array.isArray(where)) {
      return where.map((clause) => ({ ...(clause as any), ...scope }));
    }
    return { ...(where as any), ...scope };
  }

  async find(options: FindManyOptions<T> = {}): Promise<T[]> {
    return this.repo.find({
      ...options,
      where: this.scopeWhere(options.where),
    });
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repo.findOne({
      ...options,
      where: this.scopeWhere(options.where as FindManyOptions<T>['where']),
    });
  }

  async findOneBy(where: Partial<T>): Promise<T | null> {
    return this.repo.findOne({ where: { ...(where as any), ...this.scope() } });
  }

  async count(options: FindManyOptions<T> = {}): Promise<number> {
    return this.repo.count({
      ...options,
      where: this.scopeWhere(options.where),
    });
  }

  create(data: DeepPartial<T>): T {
    return this.repo.create({ ...data, ...this.scope() } as DeepPartial<T>);
  }

  async save(entity: DeepPartial<T>): Promise<T> {
    return this.repo.save({ ...entity, ...this.scope() } as any);
  }

  async update(id: string, data: DeepPartial<T>): Promise<void> {
    await this.repo.update({ id, ...this.scope() } as any, data as any);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id, ...this.scope() } as any);
  }

  async deleteBy(where: Partial<T>): Promise<void> {
    await this.repo.delete({ ...(where as any), ...this.scope() } as any);
  }

  async updateBy(where: Partial<T>, data: DeepPartial<T>): Promise<void> {
    await this.repo.update({ ...(where as any), ...this.scope() } as any, data as any);
  }

  async increment(id: string, column: string, value: number): Promise<void> {
    await this.repo.increment({ id, ...this.scope() } as any, column, value);
  }

  createQueryBuilder(alias: string): SelectQueryBuilder<T> {
    return this.repo
      .createQueryBuilder(alias)
      .andWhere(`${alias}.tenant_id = :tenantScopeId`, {
        tenantScopeId: TenantContext.getTenantId(),
      });
  }
}
