import type { Response } from 'express';
import { TenantsService } from './tenants.service';
/**
 * Sirve el logo del tenant como imagen pública (sin JWT): lo consume un <img src>
 * directo en el navegador, que no manda Authorization. Separado de TenantsController
 * porque ese tiene JwtAuthGuard a nivel de clase.
 */
export declare class TenantLogoController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    getBrandingLogo(id: string, res: Response): Promise<void>;
}
//# sourceMappingURL=tenant-logo.controller.d.ts.map