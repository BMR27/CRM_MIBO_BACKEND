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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const tenant_scoped_repository_1 = require("../../common/tenant/tenant-scoped.repository");
const orders_tokens_1 = require("./orders.tokens");
let OrdersService = class OrdersService {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }
    async create(createOrderDto) {
        const order = this.orderRepository.create(createOrderDto);
        return this.orderRepository.save(order);
    }
    async findAll() {
        return this.orderRepository.find({
            relations: ['contact'],
        });
    }
    async findOne(id) {
        return this.orderRepository.findOne({
            where: { id },
            relations: ['contact'],
        });
    }
    async findByContact(contactId) {
        return this.orderRepository.find({
            where: { contact_id: contactId },
        });
    }
    async findByOrderNumber(orderNumber) {
        return this.orderRepository.findOne({
            where: { order_number: orderNumber },
        });
    }
    async update(id, updateOrderDto) {
        await this.orderRepository.update(id, updateOrderDto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.orderRepository.delete(id);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(orders_tokens_1.ORDER_REPO)),
    __metadata("design:paramtypes", [tenant_scoped_repository_1.TenantScopedRepository])
], OrdersService);
//# sourceMappingURL=orders.service.js.map