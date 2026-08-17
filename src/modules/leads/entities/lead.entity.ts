import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone_number: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  company: string;

  @Column({ type: 'jsonb', nullable: true })
  custom_fields: Record<string, any>;

  @Column({ type: 'enum', enum: ['web', 'api'], default: 'api' })
  source: 'web' | 'api';

  @Column({ type: 'varchar', length: 255, nullable: true })
  source_detail: string;

  @Column({
    type: 'enum',
    enum: ['new', 'contacted', 'converted', 'discarded'],
    default: 'new',
  })
  status: 'new' | 'contacted' | 'converted' | 'discarded';

  @Column({ type: 'uuid', nullable: true })
  contact_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
