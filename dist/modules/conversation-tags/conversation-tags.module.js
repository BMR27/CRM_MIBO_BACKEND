"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationTagsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const conversation_tag_entity_1 = require("./entities/conversation-tag.entity");
const conversation_tags_service_1 = require("./conversation-tags.service");
const conversation_tags_controller_1 = require("./conversation-tags.controller");
let ConversationTagsModule = class ConversationTagsModule {
};
exports.ConversationTagsModule = ConversationTagsModule;
exports.ConversationTagsModule = ConversationTagsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([conversation_tag_entity_1.ConversationTag])],
        providers: [conversation_tags_service_1.ConversationTagsService],
        controllers: [conversation_tags_controller_1.ConversationTagsController],
        exports: [conversation_tags_service_1.ConversationTagsService],
    })
], ConversationTagsModule);
//# sourceMappingURL=conversation-tags.module.js.map