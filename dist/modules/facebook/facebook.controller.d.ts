import type { Response } from 'express';
import { FacebookService } from './facebook.service';
import { FacebookIntegrationsService } from './facebook-integrations.service';
export declare class FacebookController {
    private facebookService;
    private integrationsService;
    constructor(facebookService: FacebookService, integrationsService: FacebookIntegrationsService);
    verifyWebhook(mode: string, token: string, challenge: string): Promise<string>;
    handleWebhook(body: any, res: Response): Promise<void>;
    sendMessage(body: {
        psid: string;
        message: string;
    }): Promise<{
        success: boolean;
        error?: string;
    }>;
    getIntegration(): Promise<{
        page_id: string;
        verify_token: string;
        is_active: boolean;
        has_page_access_token: boolean;
    }>;
    saveIntegration(req: any, body: {
        page_id: string;
        page_access_token?: string;
    }): Promise<{
        page_id: string;
        verify_token: string;
        is_active: boolean;
    }>;
}
//# sourceMappingURL=facebook.controller.d.ts.map