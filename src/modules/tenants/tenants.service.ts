import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';

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
}
