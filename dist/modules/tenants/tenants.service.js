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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const tenant_entity_1 = require("./entities/tenant.entity");
const secret_crypto_1 = require("../../common/crypto/secret-crypto");
function slugify(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 80);
}
let TenantsService = class TenantsService {
    constructor(tenantsRepository) {
        this.tenantsRepository = tenantsRepository;
    }
    async findById(id) {
        return this.tenantsRepository.findOne({ where: { id } });
    }
    async findAll() {
        return this.tenantsRepository.find({ order: { created_at: 'ASC' } });
    }
    async findBySlug(slug) {
        return this.tenantsRepository.findOne({ where: { slug } });
    }
    async generateUniqueSlug(name, manager) {
        const repo = manager ? manager.getRepository(tenant_entity_1.Tenant) : this.tenantsRepository;
        const base = slugify(name) || 'empresa';
        let candidate = base;
        let suffix = 1;
        while (await repo.findOne({ where: { slug: candidate } })) {
            suffix += 1;
            candidate = `${base}-${suffix}`;
        }
        return candidate;
    }
    async createTenant(data, manager) {
        const slug = await this.generateUniqueSlug(data.name, manager);
        const tenant = manager.create(tenant_entity_1.Tenant, {
            name: data.name,
            slug,
            contact_email: data.contact_email,
            legal_type: data.legal_type || 'fisica',
            tax_id: data.tax_id,
            legal_name: data.legal_name,
        });
        return manager.save(tenant_entity_1.Tenant, tenant);
    }
    async renameTenant(id, name) {
        await this.tenantsRepository.update(id, { name });
        return this.findById(id);
    }
    async updateFeatureFlags(id, flags) {
        const update = {};
        if (typeof flags.bulk_messaging_enabled === 'boolean') {
            update.bulk_messaging_enabled = flags.bulk_messaging_enabled;
        }
        if (typeof flags.wa_templates_enabled === 'boolean') {
            update.wa_templates_enabled = flags.wa_templates_enabled;
        }
        await this.tenantsRepository.update(id, update);
        return this.findById(id);
    }
    /**
     * Actualiza la URL de webhook saliente y/o su estado (habilitado/deshabilitado).
     * Si se habilita y el tenant todavía no tiene un secreto de firma, genera uno nuevo
     * y lo devuelve en texto plano (solo esta vez) para que el admin lo copie.
     */
    async updateWebhookConfig(id, input) {
        const tenant = await this.findById(id);
        if (!tenant) {
            throw new common_1.BadRequestException('Espacio de trabajo no encontrado');
        }
        const update = {};
        if (input.webhook_url !== undefined) {
            const url = String(input.webhook_url || '').trim();
            if (url) {
                if (!/^https?:\/\//i.test(url)) {
                    throw new common_1.BadRequestException('webhook_url debe ser una URL http(s) válida');
                }
                update.webhook_url = url;
            }
            else {
                update.webhook_url = null;
            }
        }
        if (typeof input.enabled === 'boolean') {
            update.webhook_events_enabled = input.enabled;
        }
        let plainSecret;
        const willBeEnabled = update.webhook_events_enabled ?? tenant.webhook_events_enabled;
        if (willBeEnabled && !tenant.webhook_secret_encrypted) {
            plainSecret = (0, crypto_1.randomBytes)(32).toString('hex');
            update.webhook_secret_encrypted = (0, secret_crypto_1.encryptSecret)(plainSecret);
        }
        await this.tenantsRepository.update(id, update);
        const updated = await this.findById(id);
        return { tenant: updated, plainSecret };
    }
    async rotateWebhookSecret(id) {
        const plainSecret = (0, crypto_1.randomBytes)(32).toString('hex');
        await this.tenantsRepository.update(id, {
            webhook_secret_encrypted: (0, secret_crypto_1.encryptSecret)(plainSecret),
        });
        return plainSecret;
    }
    async getWebhookSecretPlain(id) {
        const tenant = await this.findById(id);
        if (!tenant?.webhook_secret_encrypted)
            return null;
        return (0, secret_crypto_1.decryptSecret)(tenant.webhook_secret_encrypted);
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map