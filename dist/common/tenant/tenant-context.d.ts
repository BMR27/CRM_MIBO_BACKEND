export declare const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";
export interface TenantContextData {
    tenantId: string;
    userId?: string;
    role?: string;
}
export declare class TenantContext {
    private static als;
    static run<T>(data: TenantContextData, fn: () => T): T;
    static get(): TenantContextData | undefined;
    static getTenantId(): string;
}
//# sourceMappingURL=tenant-context.d.ts.map