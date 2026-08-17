import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from './entities/api-key.entity';
import { ApiKeysService } from './api-keys.service';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeyGuard } from './guards/api-key.guard';
import { API_KEY_REPO } from './api-keys.tokens';
import { tenantScopedRepositoryProvider } from '../../common/tenant/tenant-scoped-repository.provider';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKey])],
  providers: [
    ApiKeysService,
    ApiKeyGuard,
    tenantScopedRepositoryProvider(API_KEY_REPO, ApiKey),
  ],
  controllers: [ApiKeysController],
  exports: [ApiKeysService, ApiKeyGuard],
})
export class ApiKeysModule {}
