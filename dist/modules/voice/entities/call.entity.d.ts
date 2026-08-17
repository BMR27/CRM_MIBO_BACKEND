export declare class Call {
    id: string;
    tenant_id: string;
    conversation_id: string;
    contact_id: string;
    direction: 'inbound' | 'outbound';
    from_number: string;
    to_number: string;
    twilio_call_sid: string;
    status: string;
    duration_seconds: number;
    created_at: Date;
}
//# sourceMappingURL=call.entity.d.ts.map