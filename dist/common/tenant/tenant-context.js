"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantContext = exports.DEFAULT_TENANT_ID = void 0;
const async_hooks_1 = require("async_hooks");
const common_1 = require("@nestjs/common");
exports.DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';
class TenantContext {
    static run(data, fn) {
        return this.als.run(data, fn);
    }
    static get() {
        return this.als.getStore();
    }
    static getTenantId() {
        const store = this.als.getStore();
        if (!store?.tenantId) {
            throw new common_1.InternalServerErrorException('TenantContext no inicializado: ninguna solicitud debería llegar al service layer sin tenant resuelto');
        }
        return store.tenantId;
    }
}
exports.TenantContext = TenantContext;
TenantContext.als = new async_hooks_1.AsyncLocalStorage();
//# sourceMappingURL=tenant-context.js.map