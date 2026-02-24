import { User } from '../../users/entities/user.entity';
export declare class Macro {
    id: string;
    title: string;
    content: string;
    shortcut: string;
    created_by_id: string;
    usage_count: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    created_by: User;
}
//# sourceMappingURL=macro.entity.d.ts.map