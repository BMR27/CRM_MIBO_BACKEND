import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('facebook_integrations')
export class FacebookIntegration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  tenant_id: string;

  @Column({ type: 'varchar', length: 255 })
  page_id: string;

  @Column({ type: 'text' })
  page_access_token_encrypted: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  verify_token: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
