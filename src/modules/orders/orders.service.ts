import { Inject, Injectable } from '@nestjs/common';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { TenantScopedRepository } from '../../common/tenant/tenant-scoped.repository';
import { ORDER_REPO } from './orders.tokens';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(ORDER_REPO)
    private orderRepository: TenantScopedRepository<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const order = this.orderRepository.create(createOrderDto as any);
    return this.orderRepository.save(order);
  }

  async findAll() {
    return this.orderRepository.find({
      relations: ['contact'],
    });
  }

  async findOne(id: string) {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['contact'],
    });
  }

  async findByContact(contactId: string) {
    return this.orderRepository.find({
      where: { contact_id: contactId },
    });
  }

  async findByOrderNumber(orderNumber: string) {
    return this.orderRepository.findOne({
      where: { order_number: orderNumber },
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    await this.orderRepository.update(id, updateOrderDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.orderRepository.delete(id);
  }
}
