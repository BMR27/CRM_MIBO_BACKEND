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
import { MacrosService } from './macros.service';
import { CreateMacroDto } from './dto/create-macro.dto';
import { UpdateMacroDto } from './dto/update-macro.dto';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Macros - Respuestas rápidas')
@Controller('api/macros')
export class MacrosController {
  constructor(private readonly macrosService: MacrosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear macro/respuesta rápida' })
  @ApiBody({ type: CreateMacroDto })
  create(@Body(ValidationPipe) createMacroDto: CreateMacroDto) {
    return this.macrosService.create(createMacroDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar macros' })
  findAll() {
    return this.macrosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener macro por ID' })
  @ApiParam({ name: 'id', description: 'ID de la macro' })
  findOne(@Param('id') id: string) {
    return this.macrosService.findOne(id);
  }

  @Get('shortcut/:shortcut')
  @ApiOperation({ summary: 'Buscar macro por shortcut' })
  @ApiParam({ name: 'shortcut', description: 'Atajo de la macro', example: '/saludo' })
  findByShortcut(@Param('shortcut') shortcut: string) {
    return this.macrosService.findByShortcut(shortcut);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar macro' })
  @ApiParam({ name: 'id', description: 'ID de la macro' })
  @ApiBody({ type: UpdateMacroDto })
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateMacroDto: UpdateMacroDto,
  ) {
    return this.macrosService.update(id, updateMacroDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar macro' })
  @ApiParam({ name: 'id', description: 'ID de la macro' })
  remove(@Param('id') id: string) {
    return this.macrosService.remove(id);
  }
}
