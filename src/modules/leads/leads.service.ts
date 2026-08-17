import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Lead } from './entities/lead.entity';
import { CreatePublicLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { TenantScopedRepository } from '../../common/tenant/tenant-scoped.repository';
import { LEAD_REPO } from './leads.tokens';
import { ContactsService } from '../contacts/contacts.service';

@Injectable()
export class LeadsService {
  constructor(
    @Inject(LEAD_REPO)
    private leadRepository: TenantScopedRepository<Lead>,
    private contactsService: ContactsService,
  ) {}

  async createFromPublic(dto: CreatePublicLeadDto, sourceDetail?: string) {
    const lead = this.leadRepository.create({
      name: dto.name,
      email: dto.email,
      phone_number: dto.phone_number,
      company: dto.company,
      custom_fields: dto.custom_fields,
      source: dto.source || 'api',
      source_detail: sourceDetail,
      status: 'new',
    } as any);
    return this.leadRepository.save(lead);
  }

  async findAll() {
    return this.leadRepository.find({ order: { created_at: 'DESC' } as any });
  }

  async findOne(id: string) {
    const lead = await this.leadRepository.findOne({ where: { id } });
    if (!lead) throw new NotFoundException('Lead no encontrado');
    return lead;
  }

  async update(id: string, dto: UpdateLeadDto) {
    await this.leadRepository.update(id, dto as any);
    return this.findOne(id);
  }

  async convertToContact(id: string) {
    const lead = await this.findOne(id);
    if (lead.contact_id) {
      return { lead, alreadyConverted: true };
    }
    if (!lead.phone_number) {
      throw new BadRequestException('El lead no tiene phone_number, no se puede convertir a contacto');
    }

    const contact = await this.contactsService.findOrCreateByPhone(lead.phone_number);
    await this.leadRepository.update(id, { contact_id: contact.id, status: 'converted' } as any);
    return { lead: await this.findOne(id), contact, alreadyConverted: false };
  }
}
