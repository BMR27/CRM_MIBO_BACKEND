import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contact_email: string;

  @Column({
    type: 'varchar',
    length: 10,
    default: 'fisica',
  })
  legal_type: 'fisica' | 'moral';

  @Column({ type: 'varchar', length: 20, nullable: true })
  tax_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  legal_name: string;

  @Column({
    type: 'enum',
    enum: ['trial', 'active', 'suspended', 'cancelled'],
    default: 'trial',
  })
  status: 'trial' | 'active' | 'suspended' | 'cancelled';

  @Column({ type: 'varchar', length: 50, default: 'free' })
  plan: string;

  /** Inicio y vencimiento de la suscripción actual. Ver migración 024. */
  @Column({ type: 'timestamptz', nullable: true })
  plan_started_at: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  plan_expires_at: Date | null;

  @Column({ type: 'boolean', default: false })
  bulk_messaging_enabled: boolean;

  @Column({ type: 'boolean', default: false })
  wa_templates_enabled: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  webhook_url: string | null;

  @Column({ type: 'text', nullable: true })
  webhook_secret_encrypted: string | null;

  @Column({ type: 'boolean', default: false })
  webhook_events_enabled: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  branding_logo_url: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  branding_accent_color: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  branding_display_name: string | null;

  @Column({ type: 'bytea', nullable: true, select: false })
  branding_logo_data: Buffer | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  branding_logo_mime: string | null;

  @Column({ type: 'boolean', default: false })
  module_citas_enabled: boolean;

  @Column({ type: 'boolean', default: false })
  module_agentes_enabled: boolean;

  @Column({ type: 'boolean', default: false })
  module_leads_enabled: boolean;

  @Column({ type: 'boolean', default: false })
  module_docs_api_enabled: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];
}
