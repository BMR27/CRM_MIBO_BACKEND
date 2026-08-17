import { ApiKeysService } from './api-keys.service';
export declare class ApiKeysController {
    private apiKeysService;
    constructor(apiKeysService: ApiKeysService);
    private assertAdmin;
    create(req: any, body: {
        name: string;
    }): Promise<{
        id: string;
        name: string;
        key: string;
        key_prefix: string;
        created_at: Date;
        warning: string;
    }>;
    findAll(req: any): Promise<{
        id: string;
        name: string;
        key_prefix: string;
        is_active: boolean;
        last_used_at: Date;
        created_at: Date;
    }[]>;
    revoke(req: any, id: string): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=api-keys.controller.d.ts.map