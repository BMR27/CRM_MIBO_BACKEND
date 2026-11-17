/**
 * Una fila por destinatario de un envío masivo, se haya enviado o haya fallado.
 *
 * A propósito sin relaciones a Contact/Conversation: la bitácora de la campaña debe
 * sobrevivir a que se borre la conversación o el contacto (antes el detalle se
 * reconstruía desde los mensajes y se perdía con ellos). Ver migración 023.
 */
export declare class CampaignRecipient {
    id: string;
    tenant_id: string;
    campaign_id: string;
    campaign_code: string | null;
    campaign_name: string | null;
    template_sid: string | null;
    template_name: string | null;
    contact_id: string | null;
    conversation_id: string | null;
    contact_name: string | null;
    phone_number: string | null;
    /** sent | failed | skipped */
    status: string;
    error: string | null;
    message_sid: string | null;
    content: string | null;
    created_at: Date;
}
//# sourceMappingURL=campaign-recipient.entity.d.ts.map