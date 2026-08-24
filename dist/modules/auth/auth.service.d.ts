import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
export declare function normalizeRole(name?: string): 'admin' | 'supervisor' | 'agent';
export declare class AuthService {
    private jwtService;
    constructor(jwtService: JwtService);
    signToken(user: Pick<User, 'id' | 'email' | 'role'>, tenantId: string, isPlatformAdmin?: boolean): string;
}
//# sourceMappingURL=auth.service.d.ts.map