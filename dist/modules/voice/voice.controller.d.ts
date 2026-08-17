import { VoiceService } from './voice.service';
import { VoiceIntegrationsService } from './voice-integrations.service';
export declare class VoiceController {
    private voiceService;
    private integrationsService;
    constructor(voiceService: VoiceService, integrationsService: VoiceIntegrationsService);
    getToken(req: any): Promise<{
        token: string;
        identity: string;
    }>;
    twimlOutgoing(body: {
        To?: string;
        tenantId?: string;
    }): Promise<string>;
    twimlIncoming(body: {
        From?: string;
        To?: string;
        CallSid?: string;
    }): Promise<string>;
    statusWebhook(body: {
        CallSid?: string;
        CallStatus?: string;
        CallDuration?: string;
    }): Promise<{
        success: boolean;
    }>;
    getIntegration(): Promise<{
        twilio_account_sid: string;
        twilio_api_key_sid: string;
        twiml_app_sid: string;
        voice_number: string;
        is_active: boolean;
    }>;
    saveIntegration(req: any, body: any): Promise<{
        twilio_account_sid: string;
        voice_number: string;
        is_active: boolean;
    }>;
}
//# sourceMappingURL=voice.controller.d.ts.map