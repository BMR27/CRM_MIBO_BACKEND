import { Inject, Injectable } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import { ApiKey } from './entities/api-key.entity';
import { TenantScopedRepository } from '../../common/tenant/tenant-scoped.repository';
import { API_KEY_REPO } from './api-keys.tokens';

const KEY_PREFIX = 'mibo_lv_';

function hashKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex');
}

@Injectable()
export class ApiKeysService {
  constructor(
    @Inject(API_KEY_REPO)
    private apiKeyRepository: TenantScopedRepository<ApiKey>,
  ) {}

  async create(name: string): Promise<{ apiKey: ApiKey; rawKey: string }> {
    const secret = randomBytes(24).toString('base64url');
    const rawKey = `${KEY_PREFIX}${secret}`;
    const keyPrefix = rawKey.slice(0, 12);

    const entity = this.apiKeyRepository.create({
      name,
      key_prefix: keyPrefix,
      key_hash: hashKey(rawKey),
      is_active: true,
    } as any);
    const apiKey = await this.apiKeyRepository.save(entity);
    return { apiKey, rawKey };
  }

  async findAllForTenant(): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({ order: { created_at: 'DESC' } as any });
  }

  async revoke(id: string): Promise<void> {
    await this.apiKeyRepository.update(id, { is_active: false } as any);
  }

  /**
   * Búsqueda "abierta" (sin tenant conocido todavía): el ApiKeyGuard usa este método para
   * resolver a qué tenant pertenece una API key entrante, así que no puede pasar por el
   * TenantScopedRepository (que exige tenant ya resuelto). Es la única consulta de este
   * módulo que toca el repositorio crudo.
   */
  async findActiveByRawKey(rawKey: string): Promise<ApiKey | null> {
    const hash = hashKey(rawKey);
    return this.apiKeyRepository.raw.findOne({ where: { key_hash: hash, is_active: true } });
  }

  async touchLastUsed(id: string): Promise<void> {
    await this.apiKeyRepository.raw.update(id, { last_used_at: new Date() });
  }
}
