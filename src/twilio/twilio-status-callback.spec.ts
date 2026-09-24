import { TwilioService } from './twilio.service';
import { MessagesService } from '../modules/messages/messages.service';
import { WebhookDispatchService } from '../modules/tenants/webhook-dispatch.service';
import { WhatsappIntegrationsService } from '../modules/whatsapp/whatsapp-integrations.service';

describe('TwilioService.handleStatusCallback', () => {
  const tenantId = 'tenant-1';
  let service: TwilioService;
  let messagesService: jest.Mocked<Pick<MessagesService, 'findByWhatsappMessageId' | 'updateDeliveryStatus'>>;
  let webhookDispatchService: jest.Mocked<Pick<WebhookDispatchService, 'dispatch'>>;

  beforeEach(() => {
    messagesService = {
      findByWhatsappMessageId: jest.fn(),
      updateDeliveryStatus: jest.fn(),
    };
    webhookDispatchService = {
      dispatch: jest.fn().mockResolvedValue({ skipped: false, success: true }),
    };
    service = new TwilioService(
      {} as WhatsappIntegrationsService,
      messagesService as unknown as MessagesService,
      webhookDispatchService as unknown as WebhookDispatchService,
    );
  });

  it('ignora el callback si falta MessageSid o MessageStatus', async () => {
    const result = await service.handleStatusCallback(tenantId, { MessageSid: 'SM123' });
    expect(result).toEqual({ received: true, ignored: true });
    expect(webhookDispatchService.dispatch).not.toHaveBeenCalled();
  });

  it('actualiza el mensaje y despacha el webhook cuando el mensaje existe', async () => {
    messagesService.findByWhatsappMessageId.mockResolvedValue({
      id: 'msg-1',
      conversation_id: 'conv-1',
    } as any);
    messagesService.updateDeliveryStatus.mockResolvedValue({} as any);

    const result = await service.handleStatusCallback(tenantId, {
      MessageSid: 'SM123',
      MessageStatus: 'delivered',
      To: 'whatsapp:+525512345678',
      From: 'whatsapp:+14155238886',
    });

    expect(messagesService.findByWhatsappMessageId).toHaveBeenCalledWith('SM123');
    expect(messagesService.updateDeliveryStatus).toHaveBeenCalledWith('msg-1', 'delivered', undefined);
    expect(webhookDispatchService.dispatch).toHaveBeenCalledWith(tenantId, 'message.status_updated', {
      message_id: 'msg-1',
      conversation_id: 'conv-1',
      whatsapp_message_id: 'SM123',
      status: 'delivered',
      to: 'whatsapp:+525512345678',
      from: 'whatsapp:+14155238886',
      error_code: null,
    });
    expect(result).toEqual({ received: true, message_found: true, webhook: { skipped: false, success: true } });
  });

  it('sigue despachando el webhook aunque no se encuentre el mensaje localmente', async () => {
    messagesService.findByWhatsappMessageId.mockResolvedValue(null);

    const result = await service.handleStatusCallback(tenantId, {
      MessageSid: 'SM999',
      MessageStatus: 'failed',
      ErrorCode: '63016',
    });

    expect(messagesService.updateDeliveryStatus).not.toHaveBeenCalled();
    expect(webhookDispatchService.dispatch).toHaveBeenCalledWith(tenantId, 'message.status_updated', {
      message_id: null,
      conversation_id: null,
      whatsapp_message_id: 'SM999',
      status: 'failed',
      to: null,
      from: null,
      error_code: '63016',
    });
    expect(result.message_found).toBe(false);
  });
});
