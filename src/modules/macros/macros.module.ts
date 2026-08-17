import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Macro } from './entities/macro.entity';
import { MacrosService } from './macros.service';
import { MacrosController } from './macros.controller';
import { MACRO_REPO } from './macros.tokens';
import { tenantScopedRepositoryProvider } from '../../common/tenant/tenant-scoped-repository.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Macro])],
  providers: [MacrosService, tenantScopedRepositoryProvider(MACRO_REPO, Macro)],
  controllers: [MacrosController],
  exports: [MacrosService],
})
export class MacrosModule {}
