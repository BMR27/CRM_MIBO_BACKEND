import { Lead } from './entities/lead.entity';
import { CreatePublicLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { TenantScopedRepository } from '../../common/tenant/tenant-scoped.repository';
import { ContactsService } from '../contacts/contacts.service';
export declare class LeadsService {
    private leadRepository;
    private contactsService;
    constructor(leadRepository: TenantScopedRepository<Lead>, contactsService: ContactsService);
    createFromPublic(dto: CreatePublicLeadDto, sourceDetail?: string): Promise<Lead>;
    findAll(): Promise<Lead[]>;
    findOne(id: string): Promise<Lead>;
    update(id: string, dto: UpdateLeadDto): Promise<Lead>;
    convertToContact(id: string): Promise<{
        lead: Lead;
        alreadyConverted: boolean;
        contact?: undefined;
    } | {
        lead: Lead;
        contact: import("../contacts/entities/contact.entity").Contact;
        alreadyConverted: boolean;
    }>;
}
//# sourceMappingURL=leads.service.d.ts.map