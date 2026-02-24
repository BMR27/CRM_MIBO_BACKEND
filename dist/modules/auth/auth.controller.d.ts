import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
export declare class AuthController {
    private jwtService;
    private usersService;
    private rolesService;
    constructor(jwtService: JwtService, usersService: UsersService, rolesService: RolesService);
    signup(body: {
        email: string;
        password: string;
        name?: string;
    }): Promise<{
        message: string;
        access_token: string;
        token_type: string;
        expires_in: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
    }>;
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
        token_type: string;
        expires_in: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            role_id: string;
        };
    }>;
    getMe(req: any): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        role_id: string;
    }>;
    generateTestToken(): {
        access_token: string;
        message: string;
    };
}
//# sourceMappingURL=auth.controller.d.ts.map