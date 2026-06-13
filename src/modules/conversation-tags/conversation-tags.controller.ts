import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ValidationPipe,
} from '@nestjs/common';
import { ConversationTagsService } from './conversation-tags.service';
import { CreateConversationTagDto } from './dto/create-conversation-tag.dto';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Conversation Tags - Etiquetas')
@Controller('api/conversation-tags')
export class ConversationTagsController {
  constructor(
    private readonly conversationTagsService: ConversationTagsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear etiqueta de conversación' })
  @ApiBody({ type: CreateConversationTagDto })
  create(@Body(ValidationPipe) createTagDto: CreateConversationTagDto) {
    return this.conversationTagsService.create(createTagDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar etiquetas' })
  findAll() {
    return this.conversationTagsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener etiqueta por ID' })
  @ApiParam({ name: 'id', description: 'ID de la etiqueta' })
  findOne(@Param('id') id: string) {
    return this.conversationTagsService.findOne(id);
  }

  @Get('conversation/:conversationId')
  @ApiOperation({ summary: 'Listar etiquetas por conversación' })
  @ApiParam({ name: 'conversationId', description: 'ID de la conversación' })
  findByConversation(@Param('conversationId') conversationId: string) {
    return this.conversationTagsService.findByConversation(conversationId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar etiqueta' })
  @ApiParam({ name: 'id', description: 'ID de la etiqueta' })
  remove(@Param('id') id: string) {
    return this.conversationTagsService.remove(id);
  }
}
