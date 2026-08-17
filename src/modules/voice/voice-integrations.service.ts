import { Inject, Injectable } from '@nestjs/common';
import { VoiceIntegration } from './entities/voice-integration.entity';
import { TenantScopedRepository } from '../../common/tenant/tenant-scoped.repository';
import { VOICE_INTEGRATION_REPO } from './voice.tokens';
import { encryptSecret, decryptSecret } from '../../common/crypto/secret-crypto';

export interface VoiceResolvedConfig {
  accountSid: string;
  authToken: string;
  apiKeySid: string;
  apiKeySecret: string;
  twimlAppSid: string;
  voiceNumber: string;
}

@Injectable()
export class VoiceIntegrationsService {
  constructor(
    @Inject(VOICE_INTEGRATION_REPO)
    private repo: TenantScopedRepository<VoiceIntegration>,
  ) {}

  async getForCurrentTenant(): Promise<VoiceIntegration | null> {
    return this.repo.findOne({ where: {} });
  }

  async upsertForCurrentTenant(
    tenantId: string,
    data: {
      twilio_account_sid: string;
      twilio_auth_token?: string;
      twilio_api_key_sid: string;
      twilio_api_key_secret?: string;
      twiml_app_sid: string;
      voice_number: string;
    },
  ): Promise<VoiceIntegration> {
    const existing = await this.repo.findOne({ where: {} });

    const patch: Partial<VoiceIntegration> = {
      twilio_account_sid: data.twilio_account_sid,
      twilio_api_key_sid: data.twilio_api_key_sid,
      twiml_app_sid: data.twiml_app_sid,
      voice_number: data.voice_number,
    };
    if (data.twilio_auth_token) {
      patch.twilio_auth_token_encrypted = encryptSecret(data.twilio_auth_token);
    }
    if (data.twilio_api_key_secret) {
      patch.twilio_api_key_secret_encrypted = encryptSecret(data.twilio_api_key_secret);
    }

    if (existing) {
      await this.repo.update(existing.id, patch);
      return this.repo.findOne({ where: { id: existing.id } });
    }

    if (!data.twilio_auth_token || !data.twilio_api_key_secret) {
      throw new Error('twilio_auth_token y twilio_api_key_secret son requeridos al crear la integración');
    }

    const entity = this.repo.create({
      ...patch,
      tenant_id: tenantId,
      is_active: true,
    } as any);
    return this.repo.save(entity);
  }

  async getConfigForTenant(tenantId: string): Promise<VoiceResolvedConfig | null> {
    const integration = await this.repo.raw.findOne({ where: { tenant_id: tenantId, is_active: true } });
    if (!integration) return null;
    return {
      accountSid: integration.twilio_account_sid,
      authToken: decryptSecret(integration.twilio_auth_token_encrypted),
      apiKeySid: integration.twilio_api_key_sid,
      apiKeySecret: decryptSecret(integration.twilio_api_key_secret_encrypted),
      twimlAppSid: integration.twiml_app_sid,
      voiceNumber: integration.voice_number,
    };
  }

  async findTenantIdByVoiceNumber(voiceNumber: string): Promise<string | null> {
    const integration = await this.repo.raw.findOne({ where: { voice_number: voiceNumber, is_active: true } });
    return integration?.tenant_id || null;
  }
}
