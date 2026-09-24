import { TenantsService } from './tenants.service';
export interface WebhookDispatchResult {
    skipped: boolean;
    success?: boolean;
    retried?: boolean;
    error?: string;
}
/**
 * Envía eventos salientes al webhook_url configurado por cada tenant, firmados con
 * HMAC-SHA256 usando su webhook_secret. No lanza si el envío falla (los eventos de
 * mensajería no deben tumbar el flujo que los origina); registra el error y regresa
 * el resultado para que el llamador decida si loguearlo.
 */
export declare class WebhookDispatchService {
    private readonly tenantsService;
    private readonly logger;
    constructor(tenantsService: TenantsService);
    dispatch(tenantId: string, event: string, data: Record<string, any>): Promise<WebhookDispatchResult>;
}
//# sourceMappingURL=webhook-dispatch.service.d.ts.map