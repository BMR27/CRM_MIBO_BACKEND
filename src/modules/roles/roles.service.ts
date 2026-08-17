import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async findAll(tenantId: string): Promise<Role[]> {
    return this.rolesRepository.find({
      where: { tenant_id: tenantId, is_active: true },
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<Role> {
    return this.rolesRepository.findOne({ where: { id } });
  }

  async findByNameForTenant(tenantId: string, name: string): Promise<Role> {
    return this.rolesRepository.findOne({ where: { tenant_id: tenantId, name } });
  }

  async create(data: Partial<Role>): Promise<Role> {
    const role = this.rolesRepository.create(data);
    return this.rolesRepository.save(role);
  }

  async update(id: string, data: Partial<Role>): Promise<Role> {
    await this.rolesRepository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.rolesRepository.update(id, { is_active: false });
  }

  private defaultRolesTemplate() {
    return [
      {
        name: 'Administrador',
        description: 'Acceso completo al sistema',
        permissions: {
          conversations: { read: true, write: true, delete: true },
          contacts: { read: true, write: true, delete: true },
          users: { read: true, write: true, delete: true },
          orders: { read: true, write: true, delete: true },
          macros: { read: true, write: true, delete: true },
          settings: { read: true, write: true },
          reports: { read: true },
          whatsapp: { send: true, receive: true },
        },
      },
      {
        name: 'Agente',
        description: 'Acceso a conversaciones y contactos',
        permissions: {
          conversations: { read: true, write: true, delete: false },
          contacts: { read: true, write: true, delete: false },
          users: { read: false, write: false, delete: false },
          orders: { read: true, write: true, delete: false },
          macros: { read: true, write: false, delete: false },
          settings: { read: false, write: false },
          reports: { read: false },
          whatsapp: { send: true, receive: true },
        },
      },
      {
        name: 'Supervisor',
        description: 'Acceso a reportes y gestión de conversaciones',
        permissions: {
          conversations: { read: true, write: true, delete: true },
          contacts: { read: true, write: true, delete: false },
          users: { read: true, write: false, delete: false },
          orders: { read: true, write: true, delete: false },
          macros: { read: true, write: true, delete: true },
          settings: { read: true, write: false },
          reports: { read: true },
          whatsapp: { send: true, receive: true },
        },
      },
      {
        name: 'Usuario',
        description: 'Acceso solo lectura',
        permissions: {
          conversations: { read: true, write: false, delete: false },
          contacts: { read: true, write: false, delete: false },
          users: { read: false, write: false, delete: false },
          orders: { read: true, write: false, delete: false },
          macros: { read: true, write: false, delete: false },
          settings: { read: false, write: false },
          reports: { read: false },
          whatsapp: { send: false, receive: false },
        },
      },
    ];
  }

  /**
   * Siembra los 4 roles por defecto para un tenant específico.
   * Si se pasa un `manager` (ej. dentro de una transacción de signup-company), lo usa en vez del repo propio.
   */
  async seedDefaultRolesForTenant(tenantId: string, manager?: EntityManager): Promise<void> {
    const repo = manager ? manager.getRepository(Role) : this.rolesRepository;

    const existingRoles = await repo.count({ where: { tenant_id: tenantId } });
    if (existingRoles > 0) return;

    for (const roleData of this.defaultRolesTemplate()) {
      const role = repo.create({ ...roleData, tenant_id: tenantId });
      await repo.save(role);
    }
  }
}
