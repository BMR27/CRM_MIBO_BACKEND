import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediaAssetsService } from './media-assets.service';

const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp']);
const MAX_BYTES = 5 * 1024 * 1024;
const EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

@ApiTags('Media Assets - Imágenes públicas para plantillas')
@Controller('media-assets')
export class MediaAssetsController {
  constructor(private readonly mediaAssetsService: MediaAssetsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Sube una imagen y devuelve una URL pública estable (p. ej. para header de plantillas de WhatsApp)',
  })
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  async upload(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Falta el archivo');
    }
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException('La imagen debe ser PNG, JPG o WEBP');
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('La imagen no puede pesar más de 5MB');
    }
    const asset = await this.mediaAssetsService.create({
      tenantId: req.user?.tenantId || null,
      mimeType: file.mimetype,
      buffer: file.buffer,
    });
    const base = process.env.PUBLIC_API_URL || '';
    const ext = EXT_BY_MIME[file.mimetype] || 'jpg';
    return {
      id: asset.id,
      url: `${base.replace(/\/$/, '')}/api/media-assets/${asset.id}.${ext}`,
    };
  }

  // Twilio exige que la URL del header de la plantilla termine en una extensión de
  // imagen reconocible (.jpg/.png/.webp) o rechaza el registro con "media extension
  // is not supported" — por eso la ruta acepta "id.ext" en vez de solo "id".
  @Get(':id.:ext')
  @ApiExcludeEndpoint()
  async get(@Param('id') id: string, @Res() res: Response) {
    const asset = await this.mediaAssetsService.findById(id);
    if (!asset) {
      throw new NotFoundException('Imagen no encontrada');
    }
    res.setHeader('Content-Type', asset.mime_type);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(asset.data);
  }
}
