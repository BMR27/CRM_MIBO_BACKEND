import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import twilio from 'twilio';
import { Call } from './entities/call.entity';
import { TenantScopedRepository } from '../../common/tenant/tenant-scoped.repository';
import { CALL_REPO } from './voice.tokens';
import { TenantContext } from '../../common/tenant/tenant-context';
import { VoiceIntegrationsService } from './voice-integrations.service';
import { ContactsService } from '../contacts/contacts.service';
import { ConversationsService } from '../conversations/conversations.service';

const { AccessToken } = twilio.jwt;
const { VoiceGrant } = AccessToken;
const { VoiceResponse } = twilio.twiml;

@Injectable()
export class VoiceService {
  constructor(
    @Inject(CALL_REPO)
    private callRepository: TenantScopedRepository<Call>,
    private integrationsService: VoiceIntegrationsService,
    private contactsService: ContactsService,
    private conversationsService: ConversationsService,
  ) {}

  private async getConfig() {
    const tenantId = TenantContext.getTenantId();
    const config = await this.integrationsService.getConfigForTenant(tenantId);
    if (!config) {
      throw new BadRequestException('Voice (Twilio) no está configurado para este espacio de trabajo');
    }
    return config;
  }

  /** Access Token de corta duración para inicializar el SDK de Twilio Voice en el navegador. */
  async generateAccessToken(userId: string): Promise<{ token: string; identity: string }> {
    const tenantId = TenantContext.getTenantId();
    const config = await this.getConfig();
    const identity = `tenant-${tenantId}`;

    const accessToken = new AccessToken(config.accountSid, config.apiKeySid, config.apiKeySecret, {
      identity,
      ttl: 3600,
    });
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: config.twimlAppSid,
      incomingAllow: true,
    });
    accessToken.addGrant(voiceGrant);

    return { token: accessToken.toJwt(), identity };
  }

  /** TwiML para una llamada saliente iniciada desde el navegador (device.connect()). */
  async buildOutgoingTwiml(to: string): Promise<string> {
    const config = await this.getConfig();
    const response = new VoiceResponse();
    const dial = response.dial({ callerId: config.voiceNumber });
    dial.number(to);
    return response.toString();
  }

  /** Resuelve tenant por el número de Twilio que recibió la llamada entrante. */
  async resolveTenantForIncoming(toNumber: string): Promise<string | null> {
    return this.integrationsService.findTenantIdByVoiceNumber(toNumber);
  }

  /** TwiML para una llamada entrante: suena en el identity compartido del tenant. */
  buildIncomingTwiml(tenantId: string): string {
    const response = new VoiceResponse();
    const dial = response.dial();
    dial.client(`tenant-${tenantId}`);
    return response.toString();
  }

  async logIncomingCall(params: { tenantId: string; from: string; to: string; callSid: string }): Promise<void> {
    let contactId: string | null = null;
    let conversationId: string | null = null;
    try {
      const contact = await this.contactsService.findByPhoneNumber(params.from);
      if (contact) {
        contactId = contact.id;
        const conversations = await this.conversationsService.findByContact(contact.id);
        if (conversations?.length) conversationId = conversations[0].id;
      }
    } catch {
      // No bloquear el registro de la llamada si no se puede resolver el contacto
    }

    const call = this.callRepository.create({
      direction: 'inbound',
      from_number: params.from,
      to_number: params.to,
      twilio_call_sid: params.callSid,
      status: 'ringing',
      contact_id: contactId,
      conversation_id: conversationId,
    } as any);
    await this.callRepository.save(call);
  }

  async logOutgoingCall(params: { to: string; from: string; callSid?: string }): Promise<void> {
    const call = this.callRepository.create({
      direction: 'outbound',
      from_number: params.from,
      to_number: params.to,
      twilio_call_sid: params.callSid || null,
      status: 'initiated',
    } as any);
    await this.callRepository.save(call);
  }

  async updateStatusByCallSid(callSid: string, status: string, durationSeconds?: number): Promise<void> {
    await this.callRepository.raw.update(
      { twilio_call_sid: callSid },
      {
        status,
        ...(durationSeconds !== undefined ? { duration_seconds: durationSeconds } : {}),
      },
    );
  }

  async findAll(conversationId?: string) {
    if (conversationId) {
      return this.callRepository.find({ where: { conversation_id: conversationId }, order: { created_at: 'DESC' as any } });
    }
    return this.callRepository.find({ order: { created_at: 'DESC' as any } });
  }
}
