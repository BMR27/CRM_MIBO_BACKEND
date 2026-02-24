import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findAgents(): Promise<User[]>;
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