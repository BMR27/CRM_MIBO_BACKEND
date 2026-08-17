import { VoiceIntegration } from './entities/voice-integration.entity';
import { TenantScopedRepository } from '../../common/tenant/tenant-scoped.repository';
export interface VoiceResolvedConfig {
    accountSid: string;
    authToken: string;
    apiKeySid: string;
    apiKeySecret: string;
    twimlAppSid: string;
    voiceNumber: string;
}
export declare class VoiceIntegrationsService {
    private repo;
    constructor(repo: TenantScopedRepository<VoiceIntegration>);
    getForCurrentTenant(): Promise<VoiceIntegration | null>;
    upsertForCurrentTenant(tenantId: string, data: {
        twilio_account_sid: string;
        twilio_auth_token?: string;
        twilio_api_key_sid: string;
        twilio_api_key_secret?: string;
        twiml_app_sid: string;
        voice_number: string;
    }): Promise<VoiceIntegration>;
    getConfigForTenant(tenantId: string): Promise<VoiceResolvedConfig | null>;
    findTenantIdByVoiceNumber(voiceNumber: string): Promise<string | null>;
}
//# sourceMappingURL=voice-integrations.service.d.ts.map