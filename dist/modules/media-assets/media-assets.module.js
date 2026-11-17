"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaAssetsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const media_asset_entity_1 = require("./entities/media-asset.entity");
const media_assets_service_1 = require("./media-assets.service");
const media_assets_controller_1 = require("./media-assets.controller");
let MediaAssetsModule = class MediaAssetsModule {
};
exports.MediaAssetsModule = MediaAssetsModule;
exports.MediaAssetsModule = MediaAssetsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([media_asset_entity_1.MediaAsset])],
        providers: [media_assets_service_1.MediaAssetsService],
        controllers: [media_assets_controller_1.MediaAssetsController],
        exports: [media_assets_service_1.MediaAssetsService],
    })
], MediaAssetsModule);
//# sourceMappingURL=media-assets.module.js.map