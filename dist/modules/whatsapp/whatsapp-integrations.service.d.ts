import { WhatsappIntegration } from './entities/whatsapp-integration.entity';
import { TenantScopedRepository } from '../../common/tenant/tenant-scoped.repository';
export interface WhatsappResolvedConfig {
    provider: 'twilio' | 'cloud_api';
    twilioAccountSid?: string;
    twilioAuthToken?: string;
    twilioWhatsappNumber?: string;
    cloudAccessToken?: string;
    cloudPhoneNumberId?: string;
    cloudWabaId?: string;
    cloudTemplateLanguage: string;
}
export declare class WhatsappIntegrationsService {
    private repo;
    constructor(repo: TenantScopedRepository<WhatsappIntegration>);
    getForCurrentTenant(): Promise<WhatsappIntegration | null>;
    upsertForCurrentTenant(tenantId: string, data: {
        provider: 'twilio' | 'cloud_api';
        twilio_account_sid?: string;
        twilio_auth_token?: string;
        twilio_whatsapp_number?: string;
        cloud_access_token?: string;
        cloud_phone_number_id?: string;
        cloud_waba_id?: string;
        cloud_template_language?: string;
    }): Promise<WhatsappIntegration>;
    resolveConfig(integration: WhatsappIntegration): Promise<WhatsappResolvedConfig>;
    getConfigForTenant(tenantId: string): Promise<WhatsappResolvedConfig | null>;
    findTenantIdByVerifyToken(token: string): Promise<string | null>;
    findTenantIdByTwilioAccountSid(accountSid: string): Promise<string | null>;
    findTenantIdByCloudPhoneNumberId(phoneNumberId: string): Promise<string | null>;
}
//# sourceMappingURL=whatsapp-integrations.service.d.ts.map