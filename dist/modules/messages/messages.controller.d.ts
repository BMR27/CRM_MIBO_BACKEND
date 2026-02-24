import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    create(createMessageDto: CreateMessageDto): Promise<any[]>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    findByConversation(conversationId: string): Promise<any[]>;
    update(id: string, updateMessageDto: UpdateMessageDto): Promise<any>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=messages.controller.d.ts.map