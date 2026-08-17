import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ORDER_REPO } from './orders.tokens';
import { tenantScopedRepositoryProvider } from '../../common/tenant/tenant-scoped-repository.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  providers: [OrdersService, tenantScopedRepositoryProvider(ORDER_REPO, Order)],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
