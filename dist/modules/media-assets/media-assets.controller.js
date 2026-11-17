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
exports.MediaAssetsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const media_assets_service_1 = require("./media-assets.service");
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp']);
const MAX_BYTES = 5 * 1024 * 1024;
const EXT_BY_MIME = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
};
let MediaAssetsController = class MediaAssetsController {
    constructor(mediaAssetsService) {
        this.mediaAssetsService = mediaAssetsService;
    }
    async upload(req, file) {
        if (!file) {
            throw new common_1.BadRequestException('Falta el archivo');
        }
        if (!ALLOWED_MIME.has(file.mimetype)) {
            throw new common_1.BadRequestException('La imagen debe ser PNG, JPG o WEBP');
        }
        if (file.size > MAX_BYTES) {
            throw new common_1.BadRequestException('La imagen no puede pesar más de 5MB');
        }
        const asset = await this.mediaAssetsService.create({
            tenantId: req.user?.tenantId || null,
            mimeType: file.mimetype,
            buffer: file.buffer,
        });
        const base = process.env.PUBLIC_API_URL || '';
        const ext = EXT_BY_MIME[file.mimetype] || 'jpg';
        return {
            id: asset.id,
            url: `${base.replace(/\/$/, '')}/api/media-assets/${asset.id}.${ext}`,
        };
    }
    // Twilio exige que la URL del header de la plantilla termine en una extensión de
    // imagen reconocible (.jpg/.png/.webp) o rechaza el registro con "media extension
    // is not supported" — por eso la ruta acepta "id.ext" en vez de solo "id".
    async get(id, res) {
        const asset = await this.mediaAssetsService.findById(id);
        if (!asset) {
            throw new common_1.NotFoundException('Imagen no encontrada');
        }
        res.setHeader('Content-Type', asset.mime_type);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.send(asset.data);
    }
};
exports.MediaAssetsController = MediaAssetsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({
        summary: 'Sube una imagen y devuelve una URL pública estable (p. ej. para header de plantillas de WhatsApp)',
    }),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MediaAssetsController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(':id.:ext'),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MediaAssetsController.prototype, "get", null);
exports.MediaAssetsController = MediaAssetsController = __decorate([
    (0, swagger_1.ApiTags)('Media Assets - Imágenes públicas para plantillas'),
    (0, common_1.Controller)('media-assets'),
    __metadata("design:paramtypes", [media_assets_service_1.MediaAssetsService])
], MediaAssetsController);
//# sourceMappingURL=media-assets.controller.js.map