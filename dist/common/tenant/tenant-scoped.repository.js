"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantScopedRepository = void 0;
const tenant_context_1 = require("./tenant-context");
/**
 * Wrapper delgado sobre Repository<T> que agrega `tenant_id` a toda operación de lectura,
 * escritura y borrado. Se usa en lugar del Repository crudo en cualquier service que toque
 * datos de negocio (contacts, conversations, messages, orders, macros, conversation_tags).
 *
 * Requiere que TenantContext ya tenga un tenantId publicado (lo hace TenantInterceptor,
 * global, para toda request) — si no, lanza en vez de devolver/mutar datos de otro tenant.
 */
class TenantScopedRepository {
    constructor(repo) {
        this.repo = repo;
    }
    scope() {
        return { tenant_id: tenant_context_1.TenantContext.getTenantId() };
    }
    get raw() {
        return this.repo;
    }
    scopeWhere(where) {
        const scope = this.scope();
        if (Array.isArray(where)) {
            return where.map((clause) => ({ ...clause, ...scope }));
        }
        return { ...where, ...scope };
    }
    async find(options = {}) {
        return this.repo.find({
            ...options,
            where: this.scopeWhere(options.where),
        });
    }
    async findOne(options) {
        return this.repo.findOne({
            ...options,
            where: this.scopeWhere(options.where),
        });
    }
    async findOneBy(where) {
        return this.repo.findOne({ where: { ...where, ...this.scope() } });
    }
    async count(options = {}) {
        return this.repo.count({
            ...options,
            where: this.scopeWhere(options.where),
        });
    }
    create(data) {
        return this.repo.create({ ...data, ...this.scope() });
    }
    async save(entity) {
        return this.repo.save({ ...entity, ...this.scope() });
    }
    async update(id, data) {
        await this.repo.update({ id, ...this.scope() }, data);
    }
    async delete(id) {
        await this.repo.delete({ id, ...this.scope() });
    }
    async deleteBy(where) {
        await this.repo.delete({ ...where, ...this.scope() });
    }
    async updateBy(where, data) {
        await this.repo.update({ ...where, ...this.scope() }, data);
    }
    async increment(id, column, value) {
        await this.repo.increment({ id, ...this.scope() }, column, value);
    }
    createQueryBuilder(alias) {
        return this.repo
            .createQueryBuilder(alias)
            .andWhere(`${alias}.tenant_id = :tenantScopeId`, {
            tenantScopeId: tenant_context_1.TenantContext.getTenantId(),
        });
    }
}
exports.TenantScopedRepository = TenantScopedRepository;
//# sourceMappingURL=tenant-scoped.repository.js.map