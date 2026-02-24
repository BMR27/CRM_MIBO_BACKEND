import { MacrosService } from './macros.service';
import { CreateMacroDto } from './dto/create-macro.dto';
import { UpdateMacroDto } from './dto/update-macro.dto';
export declare class MacrosController {
    private readonly macrosService;
    constructor(macrosService: MacrosService);
    create(createMacroDto: CreateMacroDto): Promise<CreateMacroDto & import("./entities/macro.entity").Macro>;
    findAll(): Promise<import("./entities/macro.entity").Macro[]>;
    findOne(id: string): Promise<import("./entities/macro.entity").Macro>;
    findByShortcut(shortcut: string): Promise<import("./entities/macro.entity").Macro>;
    update(id: string, updateMacroDto: UpdateMacroDto): Promise<import("./entities/macro.entity").Macro>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=macros.controller.d.ts.map