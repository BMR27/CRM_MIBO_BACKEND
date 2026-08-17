"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("./entities/role.entity");
let RolesService = class RolesService {
    constructor(rolesRepository) {
        this.rolesRepository = rolesRepository;
    }
    async findAll(tenantId) {
        return this.rolesRepository.find({
            where: { tenant_id: tenantId, is_active: true },
            order: { name: 'ASC' },
        });
    }
    async findById(id) {
        return this.rolesRepository.findOne({ where: { id } });
    }
    async findByNameForTenant(tenantId, name) {
        return this.rolesRepository.findOne({ where: { tenant_id: tenantId, name } });
    }
    async create(data) {
        const role = this.rolesRepository.create(data);
        return this.rolesRepository.save(role);
    }
    async update(id, data) {
        await this.rolesRepository.update(id, data);
        return this.findById(id);
    }
    async delete(id) {
        await this.rolesRepository.update(id, { is_active: false });
    }
    defaultRolesTemplate() {
        return [
            {
                name: 'Administrador',
                description: 'Acceso completo al sistema',
                permissions: {
                    conversations: { read: true, write: true, delete: true },
                    contacts: { read: true, write: true, delete: true },
                    users: { read: true, write: true, delete: true },
                    orders: { read: true, write: true, delete: true },
                    macros: { read: true, write: true, delete: true },
                    settings: { read: true, write: true },
                    reports: { read: true },
                    whatsapp: { send: true, receive: true },
                },
            },
            {
                name: 'Agente',
                description: 'Acceso a conversaciones y contactos',
                permissions: {
                    conversations: { read: true, write: true, delete: false },
                    contacts: { read: true, write: true, delete: false },
                    users: { read: false, write: false, delete: false },
                    orders: { read: true, write: true, delete: false },
                    macros: { read: true, write: false, delete: false },
                    settings: { read: false, write: false },
                    reports: { read: false },
                    whatsapp: { send: true, receive: true },
                },
            },
            {
                name: 'Supervisor',
                description: 'Acceso a reportes y gestión de conversaciones',
                permissions: {
                    conversations: { read: true, write: true, delete: true },
                    contacts: { read: true, write: true, delete: false },
                    users: { read: true, write: false, delete: false },
                    orders: { read: true, write: true, delete: false },
                    macros: { read: true, write: true, delete: true },
                    settings: { read: true, write: false },
                    reports: { read: true },
                    whatsapp: { send: true, receive: true },
                },
            },
            {
                name: 'Usuario',
                description: 'Acceso solo lectura',
                permissions: {
                    conversations: { read: true, write: false, delete: false },
                    contacts: { read: true, write: false, delete: false },
                    users: { read: false, write: false, delete: false },
                    orders: { read: true, write: false, delete: false },
                    macros: { read: true, write: false, delete: false },
                    settings: { read: false, write: false },
                    reports: { read: false },
                    whatsapp: { send: false, receive: false },
                },
            },
        ];
    }
    /**
     * Siembra los 4 roles por defecto para un tenant específico.
     * Si se pasa un `manager` (ej. dentro de una transacción de signup-company), lo usa en vez del repo propio.
     */
    async seedDefaultRolesForTenant(tenantId, manager) {
        const repo = manager ? manager.getRepository(role_entity_1.Role) : this.rolesRepository;
        const existingRoles = await repo.count({ where: { tenant_id: tenantId } });
        if (existingRoles > 0)
            return;
        for (const roleData of this.defaultRolesTemplate()) {
            const role = repo.create({ ...roleData, tenant_id: tenantId });
            await repo.save(role);
        }
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RolesService);
//# sourceMappingURL=roles.service.js.map