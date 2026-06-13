import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Contacts - Contactos')
@Controller('api/contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear contacto' })
  @ApiBody({ type: CreateContactDto })
  @ApiResponse({ status: 201, description: 'Contacto creado' })
  create(@Body(ValidationPipe) createContactDto: CreateContactDto) {
    return this.contactsService.create(createContactDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar contactos' })
  @ApiResponse({ status: 200, description: 'Lista de contactos' })
  findAll() {
    return this.contactsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener contacto por ID' })
  @ApiParam({ name: 'id', description: 'ID del contacto' })
  findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @Get('phone/:phone')
  @ApiOperation({ summary: 'Buscar contacto por teléfono' })
  @ApiParam({ name: 'phone', description: 'Teléfono en formato internacional', example: '+525512345678' })
  findByPhone(@Param('phone') phone: string) {
    return this.contactsService.findByPhoneNumber(phone);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar contacto' })
  @ApiParam({ name: 'id', description: 'ID del contacto' })
  @ApiBody({ type: UpdateContactDto })
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateContactDto: UpdateContactDto,
  ) {
    console.log('[ContactsController] PATCH /contacts/:id', { id, updateContactDto });
    return this.contactsService.update(id, updateContactDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar contacto' })
  @ApiParam({ name: 'id', description: 'ID del contacto' })
  remove(@Param('id') id: string) {
    console.log('[ContactsController] DELETE /contacts/:id', { id });
    return this.contactsService.remove(id);
  }
}
