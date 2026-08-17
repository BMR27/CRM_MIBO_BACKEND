import { Inject, Injectable } from '@nestjs/common';
import { Macro } from './entities/macro.entity';
import { CreateMacroDto } from './dto/create-macro.dto';
import { UpdateMacroDto } from './dto/update-macro.dto';
import { TenantScopedRepository } from '../../common/tenant/tenant-scoped.repository';
import { MACRO_REPO } from './macros.tokens';

@Injectable()
export class MacrosService {
  constructor(
    @Inject(MACRO_REPO)
    private macroRepository: TenantScopedRepository<Macro>,
  ) {}

  async create(createMacroDto: CreateMacroDto) {
    const macro = this.macroRepository.create(createMacroDto as any);
    return this.macroRepository.save(macro);
  }

  async findAll() {
    return this.macroRepository.find({
      where: { is_active: true },
      relations: ['created_by'],
    });
  }

  async findOne(id: string) {
    return this.macroRepository.findOne({
      where: { id },
      relations: ['created_by'],
    });
  }

  async findByShortcut(shortcut: string) {
    return this.macroRepository.findOne({
      where: { shortcut },
    });
  }

  async findByUser(userId: string) {
    return this.macroRepository.find({
      where: { created_by_id: userId, is_active: true },
    });
  }

  async update(id: string, updateMacroDto: UpdateMacroDto) {
    await this.macroRepository.update(id, updateMacroDto);
    return this.findOne(id);
  }

  async incrementUsage(id: string) {
    await this.macroRepository.increment(id, 'usage_count', 1);
  }

  async remove(id: string) {
    await this.macroRepository.delete(id);
  }
}
