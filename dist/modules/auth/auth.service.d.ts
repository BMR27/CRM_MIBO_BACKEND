import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
export declare function normalizeRole(name?: string): 'admin' | 'supervisor' | 'agent';
export declare class AuthService {
    private jwtService;
    constructor(jwtService: JwtService);
    signToken(user: Pick<User, 'id' | 'email' | 'role'>, tenantId: string): string;
}
//# sourceMappingURL=auth.service.d.ts.map