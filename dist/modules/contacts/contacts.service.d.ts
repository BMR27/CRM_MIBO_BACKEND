import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { TenantScopedRepository } from '../../common/tenant/tenant-scoped.repository';
export declare class ContactsService {
    private contactRepository;
    constructor(contactRepository: TenantScopedRepository<Contact>);
    create(createContactDto: CreateContactDto): Promise<Contact>;
    findAll(): Promise<Contact[]>;
    findOne(id: string): Promise<Contact>;
    findByPhoneNumber(phoneNumber: string): Promise<Contact>;
    findOrCreateByPhone(phoneNumber: string): Promise<Contact>;
    update(id: string, updateContactDto: UpdateContactDto): Promise<Contact>;
    updateLastSeen(id: string): Promise<void>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=contacts.service.d.ts.map