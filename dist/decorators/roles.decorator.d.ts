export declare const ROLES_KEY = "roles";
/**
 * Decorator to specify which roles are allowed to access a route or method
 * @param roles - The roles that are allowed to access the decorated route/method
 *
 * @example
 * @Roles('admin', 'supervisor')
 * @Get('agents')
 * async getAgents() { }
 */
export declare const Roles: (...roles: string[]) => import("@nestjs/common").CustomDecorator<string>;
//# sourceMappingURL=roles.decorator.d.ts.map