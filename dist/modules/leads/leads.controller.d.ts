import { LeadsService } from './leads.service';
import { CreatePublicLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
export declare class LeadsController {
    private leadsService;
    constructor(leadsService: LeadsService);
    createPublicLead(dto: CreatePublicLeadDto, req: any): Promise<{
        success: boolean;
        lead: {
            id: string;
            status: "new" | "contacted" | "converted" | "discarded";
            created_at: Date;
        };
    }>;
    findAll(): Promise<import("./entities/lead.entity").Lead[]>;
    update(id: string, dto: UpdateLeadDto): Promise<import("./entities/lead.entity").Lead>;
    convert(id: string): Promise<{
        lead: import("./entities/lead.entity").Lead;
        alreadyConverted: boolean;
        contact?: undefined;
    } | {
        lead: import("./entities/lead.entity").Lead;
        contact: import("../contacts/entities/contact.entity").Contact;
        alreadyConverted: boolean;
    }>;
}
//# sourceMappingURL=leads.controller.d.ts.map