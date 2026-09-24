import { createHmac } from 'crypto';
import axios from 'axios';
import { WebhookDispatchService } from './webhook-dispatch.service';
import { TenantsService } from './tenants.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WebhookDispatchService', () => {
  const tenantId = 'tenant-1';
  let tenantsService: jest.Mocked<Pick<TenantsService, 'findById' | 'getWebhookSecretPlain'>>;
  let service: WebhookDispatchService;

  beforeEach(() => {
    jest.clearAllMocks();
    tenantsService = {
      findById: jest.fn(),
      getWebhookSecretPlain: jest.fn(),
    };
    service = new WebhookDispatchService(tenantsService as unknown as TenantsService);
  });

  it('omite el envío si el tenant no tiene webhook_events_enabled', async () => {
    tenantsService.findById.mockResolvedValue({
      webhook_events_enabled: false,
      webhook_url: 'https://example.com/hook',
    } as any);

    const result = await service.dispatch(tenantId, 'message.status_updated', { foo: 'bar' });

    expect(result).toEqual({ skipped: true });
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('omite el envío si no hay webhook_url configurada', async () => {
    tenantsService.findById.mockResolvedValue({
      webhook_events_enabled: true,
      webhook_url: null,
    } as any);

    const result = await service.dispatch(tenantId, 'message.status_updated', { foo: 'bar' });

    expect(result).toEqual({ skipped: true });
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('firma el payload con HMAC-SHA256 del secreto del tenant y lo envía', async () => {
    tenantsService.findById.mockResolvedValue({
      webhook_events_enabled: true,
      webhook_url: 'https://example.com/hook',
    } as any);
    tenantsService.getWebhookSecretPlain.mockResolvedValue('super-secret');
    mockedAxios.post.mockResolvedValue({ status: 200, data: {} });

    const result = await service.dispatch(tenantId, 'message.status_updated', { status: 'delivered' });

    expect(result).toEqual({ skipped: false, success: true });
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);

    const [url, body, config] = mockedAxios.post.mock.calls[0];
    expect(url).toBe('https://example.com/hook');
    expect(config.headers['X-Mibo-Event']).toBe('message.status_updated');

    const parsed = JSON.parse(body as string);
    expect(parsed.event).toBe('message.status_updated');
    expect(parsed.tenant_id).toBe(tenantId);
    expect(parsed.data).toEqual({ status: 'delivered' });

    const expectedSignature = `sha256=${createHmac('sha256', 'super-secret').update(body as string).digest('hex')}`;
    expect(config.headers['X-Mibo-Signature']).toBe(expectedSignature);
  });

  it('reintenta una vez si el primer intento falla, y reporta éxito si el segundo funciona', async () => {
    tenantsService.findById.mockResolvedValue({
      webhook_events_enabled: true,
      webhook_url: 'https://example.com/hook',
    } as any);
    tenantsService.getWebhookSecretPlain.mockResolvedValue('super-secret');
    mockedAxios.post.mockRejectedValueOnce(new Error('timeout')).mockResolvedValueOnce({ status: 200, data: {} });

    const result = await service.dispatch(tenantId, 'message.status_updated', { status: 'failed' });

    expect(result).toEqual({ skipped: false, success: true, retried: true });
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });

  it('reporta fallo si ambos intentos fallan, sin lanzar excepción', async () => {
    tenantsService.findById.mockResolvedValue({
      webhook_events_enabled: true,
      webhook_url: 'https://example.com/hook',
    } as any);
    tenantsService.getWebhookSecretPlain.mockResolvedValue('super-secret');
    mockedAxios.post.mockRejectedValue(new Error('connection refused'));

    const result = await service.dispatch(tenantId, 'message.status_updated', { status: 'failed' });

    expect(result.skipped).toBe(false);
    expect(result.success).toBe(false);
    expect(result.error).toBe('connection refused');
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });
});
