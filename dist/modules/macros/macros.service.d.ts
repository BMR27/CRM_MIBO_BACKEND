import { Macro } from './entities/macro.entity';
import { CreateMacroDto } from './dto/create-macro.dto';
import { UpdateMacroDto } from './dto/update-macro.dto';
import { TenantScopedRepository } from '../../common/tenant/tenant-scoped.repository';
export declare class MacrosService {
    private macroRepository;
    constructor(macroRepository: TenantScopedRepository<Macro>);
    create(createMacroDto: CreateMacroDto): Promise<Macro>;
    findAll(): Promise<Macro[]>;
    findOne(id: string): Promise<Macro>;
    findByShortcut(shortcut: string): Promise<Macro>;
    findByUser(userId: string): Promise<Macro[]>;
    update(id: string, updateMacroDto: UpdateMacroDto): Promise<Macro>;
    incrementUsage(id: string): Promise<void>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=macros.service.d.ts.map