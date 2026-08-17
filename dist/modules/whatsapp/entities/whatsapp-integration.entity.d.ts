export declare class WhatsappIntegration {
    id: string;
    tenant_id: string;
    provider: 'twilio' | 'cloud_api';
    twilio_account_sid: string;
    twilio_auth_token_encrypted: string;
    twilio_whatsapp_number: string;
    cloud_access_token_encrypted: string;
    cloud_phone_number_id: string;
    cloud_waba_id: string;
    cloud_template_language: string;
    verify_token: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
//# sourceMappingURL=whatsapp-integration.entity.d.ts.map