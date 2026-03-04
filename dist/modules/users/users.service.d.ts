import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Conversation } from '../conversations/entities/conversation.entity';
export declare class UsersService {
    private usersRepository;
    private conversationRepository;
    constructor(usersRepository: Repository<User>, conversationRepository: Repository<Conversation>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findAgents(): Promise<any[]>;
    findOne(id: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByEmailWithRole(email: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    updatePassword(id: string, newPassword: string): Promise<void>;
    delete(id: string): Promise<void>;
    validatePassword(user: User, password: string): Promise<boolean>;
}
//# sourceMappingURL=users.service.d.ts.map