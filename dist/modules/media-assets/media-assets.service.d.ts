import { Repository } from 'typeorm';
import { MediaAsset } from './entities/media-asset.entity';
export declare class MediaAssetsService {
    private readonly repo;
    constructor(repo: Repository<MediaAsset>);
    create(data: {
        tenantId?: string | null;
        mimeType: string;
        buffer: Buffer;
    }): Promise<MediaAsset>;
    findById(id: string): Promise<MediaAsset | null>;
}
//# sourceMappingURL=media-assets.service.d.ts.map