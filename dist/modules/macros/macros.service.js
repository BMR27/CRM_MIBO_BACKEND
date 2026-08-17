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
exports.MacrosService = void 0;
const common_1 = require("@nestjs/common");
const tenant_scoped_repository_1 = require("../../common/tenant/tenant-scoped.repository");
const macros_tokens_1 = require("./macros.tokens");
let MacrosService = class MacrosService {
    constructor(macroRepository) {
        this.macroRepository = macroRepository;
    }
    async create(createMacroDto) {
        const macro = this.macroRepository.create(createMacroDto);
        return this.macroRepository.save(macro);
    }
    async findAll() {
        return this.macroRepository.find({
            where: { is_active: true },
            relations: ['created_by'],
        });
    }
    async findOne(id) {
        return this.macroRepository.findOne({
            where: { id },
            relations: ['created_by'],
        });
    }
    async findByShortcut(shortcut) {
        return this.macroRepository.findOne({
            where: { shortcut },
        });
    }
    async findByUser(userId) {
        return this.macroRepository.find({
            where: { created_by_id: userId, is_active: true },
        });
    }
    async update(id, updateMacroDto) {
        await this.macroRepository.update(id, updateMacroDto);
        return this.findOne(id);
    }
    async incrementUsage(id) {
        await this.macroRepository.increment(id, 'usage_count', 1);
    }
    async remove(id) {
        await this.macroRepository.delete(id);
    }
};
exports.MacrosService = MacrosService;
exports.MacrosService = MacrosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(macros_tokens_1.MACRO_REPO)),
    __metadata("design:paramtypes", [tenant_scoped_repository_1.TenantScopedRepository])
], MacrosService);
//# sourceMappingURL=macros.service.js.map