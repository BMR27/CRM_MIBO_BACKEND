import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('voice_calls')
export class Call {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ type: 'uuid', nullable: true })
  conversation_id: string;

  @Column({ type: 'uuid', nullable: true })
  contact_id: string;

  @Column({ type: 'varchar', length: 10 })
  direction: 'inbound' | 'outbound';

  @Column({ type: 'varchar', length: 50, nullable: true })
  from_number: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  to_number: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  twilio_call_sid: string;

  @Column({ type: 'varchar', length: 30, default: 'initiated' })
  status: string;

  @Column({ type: 'integer', nullable: true })
  duration_seconds: number;

  @CreateDateColumn()
  created_at: Date;
}
