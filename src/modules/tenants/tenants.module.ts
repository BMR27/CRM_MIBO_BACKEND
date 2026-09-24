import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { WebhookDispatchService } from './webhook-dispatch.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  providers: [TenantsService, WebhookDispatchService],
  controllers: [TenantsController],
  exports: [TenantsService, WebhookDispatchService],
})
export class TenantsModule {}
