import { DataSource } from 'typeorm';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { TenantsService } from '../tenants/tenants.service';
import { AuthService } from './auth.service';
export declare class AuthController {
    private usersService;
    private rolesService;
    private tenantsService;
    private authService;
    private dataSource;
    constructor(usersService: UsersService, rolesService: RolesService, tenantsService: TenantsService, authService: AuthService, dataSource: DataSource);
    signupCompany(body: {
        legalType?: 'fisica' | 'moral';
        companyName: string;
        taxId?: string;
        adminName: string;
        adminEmail: string;
        adminPassword: string;
    }): Promise<{
        message: string;
        access_token: string;
        token_type: string;
        expires_in: string;
        tenant: {
            id: string;
            name: string;
            slug: string;
        };
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            tenant_id: string;
        };
    }>;
    signup(req: any, body: {
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
            tenant_id: string;
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
            tenant_id: string;
            is_platform_admin: boolean;
        };
    }>;
    impersonate(req: any, tenantId: string): Promise<{
        access_token: string;
        token_type: string;
        expires_in: string;
        tenant: {
            id: string;
            name: string;
            slug: string;
        };
    }>;
    getMe(req: any): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        role_id: string;
        tenant_id: string;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map