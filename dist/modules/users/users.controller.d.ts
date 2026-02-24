import { UsersService } from './users.service';
declare class CreateUserDto {
    email: string;
    password: string;
    full_name: string;
    role_id: string;
}
declare class UpdateUserDto {
    email?: string;
    full_name?: string;
    role_id?: string;
    status?: string;
}
declare class UpdatePasswordDto {
    newPassword: string;
}
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getUsers(): Promise<import("./entities/user.entity").User[]>;
    getAgents(): Promise<import("./entities/user.entity").User[]>;
    getUserById(id: string): Promise<import("./entities/user.entity").User>;
    createUser(body: CreateUserDto): Promise<import("./entities/user.entity").User>;
    updateUser(id: string, body: UpdateUserDto): Promise<import("./entities/user.entity").User>;
    updatePassword(id: string, body: UpdatePasswordDto): Promise<{
        message: string;
    }>;
    deleteUser(id: string): Promise<void>;
}
export {};
//# sourceMappingURL=users.controller.d.ts.map