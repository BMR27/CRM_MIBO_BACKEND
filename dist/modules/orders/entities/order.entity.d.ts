import { Contact } from '../../contacts/entities/contact.entity';
export declare class Order {
    id: string;
    order_number: string;
    contact_id: string;
    status: string;
    total_amount: number;
    items: any[];
    shipping_address: string;
    tracking_number: string;
    notes: string;
    created_at: Date;
    updated_at: Date;
    contact: Contact;
}
//# sourceMappingURL=order.entity.d.ts.map