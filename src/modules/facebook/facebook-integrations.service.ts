import { Inject, Injectable } from '@nestjs/common';
import { FacebookIntegration } from './entities/facebook-integration.entity';
import { TenantScopedRepository } from '../../common/tenant/tenant-scoped.repository';
import { FACEBOOK_INTEGRATION_REPO } from './facebook.tokens';
import { encryptSecret, decryptSecret, generateVerifyToken } from '../../common/crypto/secret-crypto';

export interface FacebookResolvedConfig {
  pageId: string;
  pageAccessToken: string;
}

@Injectable()
export class FacebookIntegrationsService {
  constructor(
    @Inject(FACEBOOK_INTEGRATION_REPO)
    private repo: TenantScopedRepository<FacebookIntegration>,
  ) {}

  async getForCurrentTenant(): Promise<FacebookIntegration | null> {
    return this.repo.findOne({ where: {} });
  }

  async upsertForCurrentTenant(
    tenantId: string,
    data: { page_id: string; page_access_token?: string },
  ): Promise<FacebookIntegration> {
    const existing = await this.repo.findOne({ where: {} });

    const patch: Partial<FacebookIntegration> = {
      page_id: data.page_id,
    };
    if (data.page_access_token) {
      patch.page_access_token_encrypted = encryptSecret(data.page_access_token);
    }

    if (existing) {
      await this.repo.update(existing.id, patch);
      return this.repo.findOne({ where: { id: existing.id } });
    }

    if (!data.page_access_token) {
      throw new Error('page_access_token es requerido al crear la integración');
    }

    const entity = this.repo.create({
      ...patch,
      tenant_id: tenantId,
      verify_token: generateVerifyToken(),
      is_active: true,
    } as any);
    return this.repo.save(entity);
  }

  async getConfigForTenant(tenantId: string): Promise<FacebookResolvedConfig | null> {
    const integration = await this.repo.raw.findOne({ where: { tenant_id: tenantId, is_active: true } });
    if (!integration) return null;
    return {
      pageId: integration.page_id,
      pageAccessToken: decryptSecret(integration.page_access_token_encrypted),
    };
  }

  async findTenantIdByPageId(pageId: string): Promise<string | null> {
    const integration = await this.repo.raw.findOne({ where: { page_id: pageId, is_active: true } });
    return integration?.tenant_id || null;
  }

  async findTenantIdByVerifyToken(token: string): Promise<string | null> {
    const integration = await this.repo.raw.findOne({ where: { verify_token: token, is_active: true } });
    return integration?.tenant_id || null;
  }
}
