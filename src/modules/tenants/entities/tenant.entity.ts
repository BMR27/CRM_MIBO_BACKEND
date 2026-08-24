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

  @Column({ type: 'boolean', default: false })
  bulk_messaging_enabled: boolean;

  @Column({ type: 'boolean', default: false })
  wa_templates_enabled: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];
}
