import { RolesService } from './roles.service';
export declare class RolesController {
    private rolesService;
    constructor(rolesService: RolesService);
    getRoles(req: any): Promise<import("./entities/role.entity").Role[]>;
    getRoleById(id: string): Promise<import("./entities/role.entity").Role>;
    createRole(body: any): Promise<import("./entities/role.entity").Role>;
    updateRole(id: string, body: any): Promise<import("./entities/role.entity").Role>;
    deleteRole(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    seedRoles(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=roles.controller.d.ts.map