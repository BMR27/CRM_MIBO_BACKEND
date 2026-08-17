import { Inject, Injectable } from '@nestjs/common';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { TenantScopedRepository } from '../../common/tenant/tenant-scoped.repository';
import { MESSAGE_REPO } from './messages.tokens';

@Injectable()
export class MessagesService {
  constructor(
    @Inject(MESSAGE_REPO)
    private messageRepository: TenantScopedRepository<Message>,
  ) {}

  async createIfNotExists(createMessageDto: CreateMessageDto) {
    if (createMessageDto.whatsapp_message_id) {
      const existing = await this.messageRepository.findOne({
        where: { whatsapp_message_id: createMessageDto.whatsapp_message_id },
      });
      if (existing) return existing;
    }
    return this.create(createMessageDto);
  }

  private attachMediaProxyUrl(message: Message): any;
  private attachMediaProxyUrl(messages: Message[]): any[];
  private attachMediaProxyUrl(
    messageOrMessages: Message | Message[] | null | undefined,
  ): any {
    if (!messageOrMessages) return messageOrMessages;
    if (Array.isArray(messageOrMessages)) {
      return messageOrMessages.map((m) => this.attachMediaProxyUrl(m));
    }

    const mediaId = (messageOrMessages as any).media_id as string | undefined;
    if (!mediaId) return messageOrMessages;

    const filename =
      ((messageOrMessages as any).media_filename as string | undefined) || '';

    let mediaProxyUrl = `/api/whatsapp/media/${encodeURIComponent(mediaId)}`;
    if (filename.trim().length > 0) {
      mediaProxyUrl += `?filename=${encodeURIComponent(filename)}`;
    }

    return {
      ...(messageOrMessages as any),
      media_proxy_url: mediaProxyUrl,
    };
  }

  async create(createMessageDto: CreateMessageDto) {
    const message = this.messageRepository.create(createMessageDto as any);
    const saved = await this.messageRepository.save(message);
    return this.attachMediaProxyUrl(saved);
  }

  async findAll() {
    const messages = await this.messageRepository.find({
      relations: ['conversation', 'sender'],
    });
    return messages.map((m) => this.attachMediaProxyUrl(m));
  }

  async findOne(id: string) {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: ['conversation', 'sender'],
    });
    return this.attachMediaProxyUrl(message);
  }

  async findByConversation(conversationId: string) {
    const messages = await this.messageRepository.find({
      where: { conversation_id: conversationId },
      relations: ['sender'],
      order: { created_at: 'ASC' },
    });
    return messages.map((m) => this.attachMediaProxyUrl(m));
  }

  async update(id: string, updateMessageDto: UpdateMessageDto) {
    await this.messageRepository.update(id, updateMessageDto as any);
    const message = await this.findOne(id);
    return this.attachMediaProxyUrl(message as any);
  }

  async remove(id: string) {
    await this.messageRepository.delete(id);
  }
}
