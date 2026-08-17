import { Inject, Injectable } from '@nestjs/common';
import { WhatsappIntegration } from './entities/whatsapp-integration.entity';
import { TenantScopedRepository } from '../../common/tenant/tenant-scoped.repository';
import { WHATSAPP_INTEGRATION_REPO } from './whatsapp.tokens';
import { encryptSecret, decryptSecret, generateVerifyToken } from '../../common/crypto/secret-crypto';

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

@Injectable()
export class WhatsappIntegrationsService {
  constructor(
    @Inject(WHATSAPP_INTEGRATION_REPO)
    private repo: TenantScopedRepository<WhatsappIntegration>,
  ) {}

  async getForCurrentTenant(): Promise<WhatsappIntegration | null> {
    return this.repo.findOne({ where: {} });
  }

  async upsertForCurrentTenant(
    tenantId: string,
    data: {
      provider: 'twilio' | 'cloud_api';
      twilio_account_sid?: string;
      twilio_auth_token?: string;
      twilio_whatsapp_number?: string;
      cloud_access_token?: string;
      cloud_phone_number_id?: string;
      cloud_waba_id?: string;
      cloud_template_language?: string;
    },
  ): Promise<WhatsappIntegration> {
    const existing = await this.repo.findOne({ where: {} });

    const patch: Partial<WhatsappIntegration> = {
      provider: data.provider,
      twilio_account_sid: data.twilio_account_sid || null,
      twilio_whatsapp_number: data.twilio_whatsapp_number || null,
      cloud_phone_number_id: data.cloud_phone_number_id || null,
      cloud_waba_id: data.cloud_waba_id || null,
      cloud_template_language: data.cloud_template_language || 'es_MX',
    };

    if (data.twilio_auth_token) {
      patch.twilio_auth_token_encrypted = encryptSecret(data.twilio_auth_token);
    }
    if (data.cloud_access_token) {
      patch.cloud_access_token_encrypted = encryptSecret(data.cloud_access_token);
    }

    if (existing) {
      await this.repo.update(existing.id, patch);
      return this.repo.findOne({ where: { id: existing.id } });
    }

    const entity = this.repo.create({
      ...patch,
      tenant_id: tenantId,
      verify_token: generateVerifyToken(),
      is_active: true,
    } as any);
    return this.repo.save(entity);
  }

  async resolveConfig(integration: WhatsappIntegration): Promise<WhatsappResolvedConfig> {
    return {
      provider: integration.provider,
      twilioAccountSid: integration.twilio_account_sid || undefined,
      twilioAuthToken: integration.twilio_auth_token_encrypted
        ? decryptSecret(integration.twilio_auth_token_encrypted)
        : undefined,
      twilioWhatsappNumber: integration.twilio_whatsapp_number || undefined,
      cloudAccessToken: integration.cloud_access_token_encrypted
        ? decryptSecret(integration.cloud_access_token_encrypted)
        : undefined,
      cloudPhoneNumberId: integration.cloud_phone_number_id || undefined,
      cloudWabaId: integration.cloud_waba_id || undefined,
      cloudTemplateLanguage: integration.cloud_template_language || 'es_MX',
    };
  }

  async getConfigForTenant(tenantId: string): Promise<WhatsappResolvedConfig | null> {
    const integration = await this.repo.raw.findOne({ where: { tenant_id: tenantId, is_active: true } });
    if (!integration) return null;
    return this.resolveConfig(integration);
  }

  // --- Lookups "abiertos" (sin tenant conocido) para resolver el tenant de un webhook entrante ---

  async findTenantIdByVerifyToken(token: string): Promise<string | null> {
    const integration = await this.repo.raw.findOne({ where: { verify_token: token, is_active: true } });
    return integration?.tenant_id || null;
  }

  async findTenantIdByTwilioAccountSid(accountSid: string): Promise<string | null> {
    const integration = await this.repo.raw.findOne({
      where: { twilio_account_sid: accountSid, is_active: true },
    });
    return integration?.tenant_id || null;
  }

  async findTenantIdByCloudPhoneNumberId(phoneNumberId: string): Promise<string | null> {
    const integration = await this.repo.raw.findOne({
      where: { cloud_phone_number_id: phoneNumberId, is_active: true },
    });
    return integration?.tenant_id || null;
  }
}
