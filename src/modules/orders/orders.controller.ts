import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Orders - Órdenes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear orden' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Orden creada' })
  create(@Body(ValidationPipe) createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar órdenes' })
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener orden por ID' })
  @ApiParam({ name: 'id', description: 'ID de la orden' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Get('contact/:contactId')
  @ApiOperation({ summary: 'Listar órdenes por contacto' })
  @ApiParam({ name: 'contactId', description: 'ID del contacto' })
  findByContact(@Param('contactId') contactId: string) {
    return this.ordersService.findByContact(contactId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar orden' })
  @ApiParam({ name: 'id', description: 'ID de la orden' })
  @ApiBody({ type: UpdateOrderDto })
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar orden' })
  @ApiParam({ name: 'id', description: 'ID de la orden' })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
