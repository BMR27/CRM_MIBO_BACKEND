import { Call } from './entities/call.entity';
import { TenantScopedRepository } from '../../common/tenant/tenant-scoped.repository';
import { VoiceIntegrationsService } from './voice-integrations.service';
import { ContactsService } from '../contacts/contacts.service';
import { ConversationsService } from '../conversations/conversations.service';
export declare class VoiceService {
    private callRepository;
    private integrationsService;
    private contactsService;
    private conversationsService;
    constructor(callRepository: TenantScopedRepository<Call>, integrationsService: VoiceIntegrationsService, contactsService: ContactsService, conversationsService: ConversationsService);
    private getConfig;
    /** Access Token de corta duración para inicializar el SDK de Twilio Voice en el navegador. */
    generateAccessToken(userId: string): Promise<{
        token: string;
        identity: string;
    }>;
    /** TwiML para una llamada saliente iniciada desde el navegador (device.connect()). */
    buildOutgoingTwiml(to: string): Promise<string>;
    /** Resuelve tenant por el número de Twilio que recibió la llamada entrante. */
    resolveTenantForIncoming(toNumber: string): Promise<string | null>;
    /** TwiML para una llamada entrante: suena en el identity compartido del tenant. */
    buildIncomingTwiml(tenantId: string): string;
    logIncomingCall(params: {
        tenantId: string;
        from: string;
        to: string;
        callSid: string;
    }): Promise<void>;
    logOutgoingCall(params: {
        to: string;
        from: string;
        callSid?: string;
    }): Promise<void>;
    updateStatusByCallSid(callSid: string, status: string, durationSeconds?: number): Promise<void>;
    findAll(conversationId?: string): Promise<Call[]>;
}
//# sourceMappingURL=voice.service.d.ts.map