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
exports.CallsController = void 0;
const common_1 = require("@nestjs/common");
let CallsController = class CallsController {
    async getCalls(conversationId) {
        // Aquí deberías consultar la base de datos por las llamadas asociadas
        // Por ahora, devuelve un array vacío para evitar el error 404
        return { calls: [] };
    }
};
exports.CallsController = CallsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('conversation_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "getCalls", null);
exports.CallsController = CallsController = __decorate([
    (0, common_1.Controller)('calls')
], CallsController);
//# sourceMappingURL=calls.controller.js.map