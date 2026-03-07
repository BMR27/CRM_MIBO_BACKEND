// Importar la función global de normalización
import { normalizePhoneNumber } from '../../lib/phone';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  async create(createContactDto: CreateContactDto) {
    // Normalizar el número antes de crear
    if (createContactDto.phone_number) {
      createContactDto.phone_number = normalizePhoneNumber(createContactDto.phone_number);
    }
    const contact = this.contactRepository.create(createContactDto);
    return this.contactRepository.save(contact);
  }

  async findAll() {
    return this.contactRepository.find();
  }

  async findOne(id: string) {
    return this.contactRepository.findOne({
      where: { id },
    });
  }

  async findByPhoneNumber(phoneNumber: string) {
    // Buscar siempre por el número normalizado
    const normalized = normalizePhoneNumber(phoneNumber);
    return this.contactRepository.findOne({
      where: { phone_number: normalized },
    });
  }

  async findOrCreateByPhone(phoneNumber: string) {
    // Normalizar el número antes de buscar o crear
    const normalized = normalizePhoneNumber(phoneNumber);
    let contact = await this.findByPhoneNumber(normalized);
    if (!contact) {
      let name = normalized;
      // Si el parámetro es un objeto y tiene campo 'cliente', usarlo como nombre
      if (typeof phoneNumber === 'object' && (phoneNumber as any)?.cliente) {
        name = (phoneNumber as any).cliente;
      }
      contact = await this.create({
        phone_number: normalized,
        name,
      });
    }
    return contact;
  }

  async update(id: string, updateContactDto: UpdateContactDto) {
    console.log('[ContactsService] update', { id, updateContactDto });
    await this.contactRepository.update(id, updateContactDto);
    return this.findOne(id);
  }

  async updateLastSeen(id: string) {
    await this.contactRepository.update(id, {
      last_seen: new Date(),
    } as any);
  }

  async remove(id: string) {
    console.log('[ContactsService] remove', { id });
    await this.contactRepository.delete(id);
  }
}
