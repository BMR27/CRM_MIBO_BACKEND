import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { Tenant } from './entities/tenant.entity';
import { encryptSecret, decryptSecret } from '../../common/crypto/secret-crypto';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
  ) {}

  async findById(id: string): Promise<Tenant | null> {
    return this.tenantsRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantsRepository.find({ order: { created_at: 'ASC' } });
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    return this.tenantsRepository.findOne({ where: { slug } });
  }

  async generateUniqueSlug(name: string, manager?: EntityManager): Promise<string> {
    const repo = manager ? manager.getRepository(Tenant) : this.tenantsRepository;
    const base = slugify(name) || 'empresa';
    let candidate = base;
    let suffix = 1;
    while (await repo.findOne({ where: { slug: candidate } })) {
      suffix += 1;
      candidate = `${base}-${suffix}`;
    }
    return candidate;
  }

  async createTenant(
    data: {
      name: string;
      contact_email?: string;
      legal_type?: 'fisica' | 'moral';
      tax_id?: string;
      legal_name?: string;
    },
    manager: EntityManager,
  ): Promise<Tenant> {
    const slug = await this.generateUniqueSlug(data.name, manager);
    const tenant = manager.create(Tenant, {
      name: data.name,
      slug,
      contact_email: data.contact_email,
      legal_type: data.legal_type || 'fisica',
      tax_id: data.tax_id,
      legal_name: data.legal_name,
    });
    return manager.save(Tenant, tenant);
  }

  async renameTenant(id: string, name: string): Promise<Tenant> {
    await this.tenantsRepository.update(id, { name });
    return this.findById(id);
  }

  async updateFeatureFlags(
    id: string,
    flags: { bulk_messaging_enabled?: boolean; wa_templates_enabled?: boolean },
  ): Promise<Tenant> {
    const update: Partial<Tenant> = {};
    if (typeof flags.bulk_messaging_enabled === 'boolean') {
      update.bulk_messaging_enabled = flags.bulk_messaging_enabled;
    }
    if (typeof flags.wa_templates_enabled === 'boolean') {
      update.wa_templates_enabled = flags.wa_templates_enabled;
    }
    await this.tenantsRepository.update(id, update);
    return this.findById(id);
  }

  /**
   * Actualiza la URL de webhook saliente y/o su estado (habilitado/deshabilitado).
   * Si se habilita y el tenant todavía no tiene un secreto de firma, genera uno nuevo
   * y lo devuelve en texto plano (solo esta vez) para que el admin lo copie.
   */
  async updateWebhookConfig(
    id: string,
    input: { webhook_url?: string | null; enabled?: boolean },
  ): Promise<{ tenant: Tenant; plainSecret?: string }> {
    const tenant = await this.findById(id);
    if (!tenant) {
      throw new BadRequestException('Espacio de trabajo no encontrado');
    }

    const update: Partial<Tenant> = {};

    if (input.webhook_url !== undefined) {
      const url = String(input.webhook_url || '').trim();
      if (url) {
        if (!/^https?:\/\//i.test(url)) {
          throw new BadRequestException('webhook_url debe ser una URL http(s) válida');
        }
        update.webhook_url = url;
      } else {
        update.webhook_url = null;
      }
    }

    if (typeof input.enabled === 'boolean') {
      update.webhook_events_enabled = input.enabled;
    }

    let plainSecret: string | undefined;
    const willBeEnabled = update.webhook_events_enabled ?? tenant.webhook_events_enabled;
    if (willBeEnabled && !tenant.webhook_secret_encrypted) {
      plainSecret = randomBytes(32).toString('hex');
      update.webhook_secret_encrypted = encryptSecret(plainSecret);
    }

    await this.tenantsRepository.update(id, update);
    const updated = await this.findById(id);
    return { tenant: updated, plainSecret };
  }

  async rotateWebhookSecret(id: string): Promise<string> {
    const plainSecret = randomBytes(32).toString('hex');
    await this.tenantsRepository.update(id, {
      webhook_secret_encrypted: encryptSecret(plainSecret),
    });
    return plainSecret;
  }

  async getWebhookSecretPlain(id: string): Promise<string | null> {
    const tenant = await this.findById(id);
    if (!tenant?.webhook_secret_encrypted) return null;
    return decryptSecret(tenant.webhook_secret_encrypted);
  }
}
