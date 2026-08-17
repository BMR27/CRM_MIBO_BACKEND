import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('whatsapp_integrations')
export class WhatsappIntegration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  tenant_id: string;

  @Column({ type: 'varchar', length: 20, default: 'twilio' })
  provider: 'twilio' | 'cloud_api';

  @Column({ type: 'varchar', length: 255, nullable: true })
  twilio_account_sid: string;

  @Column({ type: 'text', nullable: true })
  twilio_auth_token_encrypted: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  twilio_whatsapp_number: string;

  @Column({ type: 'text', nullable: true })
  cloud_access_token_encrypted: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cloud_phone_number_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cloud_waba_id: string;

  @Column({ type: 'varchar', length: 20, default: 'es_MX' })
  cloud_template_language: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  verify_token: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
