import { User } from '../../users/entities/user.entity';
export declare class Role {
    id: string;
    name: string;
    description: string;
    permissions: {
        conversations?: {
            read?: boolean;
            write?: boolean;
            delete?: boolean;
        };
        contacts?: {
            read?: boolean;
            write?: boolean;
            delete?: boolean;
        };
        users?: {
            read?: boolean;
            write?: boolean;
            delete?: boolean;
        };
        orders?: {
            read?: boolean;
            write?: boolean;
            delete?: boolean;
        };
        macros?: {
            read?: boolean;
            write?: boolean;
            delete?: boolean;
        };
        settings?: {
            read?: boolean;
            write?: boolean;
        };
        reports?: {
            read?: boolean;
        };
        whatsapp?: {
            send?: boolean;
            receive?: boolean;
        };
    };
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    users: User[];
}
//# sourceMappingURL=role.entity.d.ts.map