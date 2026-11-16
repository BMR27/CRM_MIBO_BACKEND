import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaAsset } from './entities/media-asset.entity';

@Injectable()
export class MediaAssetsService {
  constructor(
    @InjectRepository(MediaAsset)
    private readonly repo: Repository<MediaAsset>,
  ) {}

  async create(data: { tenantId?: string | null; mimeType: string; buffer: Buffer }): Promise<MediaAsset> {
    const asset = this.repo.create({
      tenant_id: data.tenantId ?? null,
      mime_type: data.mimeType,
      data: data.buffer,
    });
    return this.repo.save(asset);
  }

  async findById(id: string): Promise<MediaAsset | null> {
    return this.repo.findOne({ where: { id } });
  }
}
