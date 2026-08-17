import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('voice_integrations')
export class VoiceIntegration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  tenant_id: string;

  @Column({ type: 'varchar', length: 255 })
  twilio_account_sid: string;

  @Column({ type: 'text' })
  twilio_auth_token_encrypted: string;

  @Column({ type: 'varchar', length: 255 })
  twilio_api_key_sid: string;

  @Column({ type: 'text' })
  twilio_api_key_secret_encrypted: string;

  @Column({ type: 'varchar', length: 255 })
  twiml_app_sid: string;

  @Column({ type: 'varchar', length: 50 })
  voice_number: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
