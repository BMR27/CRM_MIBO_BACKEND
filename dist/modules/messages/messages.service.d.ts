import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
export declare class MessagesService {
    private messageRepository;
    constructor(messageRepository: Repository<Message>);
    private attachMediaProxyUrl;
    create(createMessageDto: CreateMessageDto): Promise<any[]>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    findByConversation(conversationId: string): Promise<any[]>;
    update(id: string, updateMessageDto: UpdateMessageDto): Promise<any>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=messages.service.d.ts.map