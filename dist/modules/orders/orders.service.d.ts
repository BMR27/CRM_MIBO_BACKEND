import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
export declare class OrdersService {
    private orderRepository;
    constructor(orderRepository: Repository<Order>);
    create(createOrderDto: CreateOrderDto): Promise<CreateOrderDto & Order>;
    findAll(): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    findByContact(contactId: string): Promise<Order[]>;
    findByOrderNumber(orderNumber: string): Promise<Order>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=orders.service.d.ts.map