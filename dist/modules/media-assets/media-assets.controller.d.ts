import type { Response } from 'express';
import { MediaAssetsService } from './media-assets.service';
export declare class MediaAssetsController {
    private readonly mediaAssetsService;
    constructor(mediaAssetsService: MediaAssetsService);
    upload(req: any, file: Express.Multer.File): Promise<{
        id: string;
        url: string;
    }>;
    get(id: string, res: Response): Promise<void>;
}
//# sourceMappingURL=media-assets.controller.d.ts.map