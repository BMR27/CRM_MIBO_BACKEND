import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Una fila por destinatario de un envío masivo, se haya enviado o haya fallado.
 *
 * A propósito sin relaciones a Contact/Conversation: la bitácora de la campaña debe
 * sobrevivir a que se borre la conversación o el contacto (antes el detalle se
 * reconstruía desde los mensajes y se perdía con ellos). Ver migración 023.
 */
@Entity('campaign_recipients')
export class CampaignRecipient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ type: 'varchar', length: 128 })
  campaign_id: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  campaign_code: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  campaign_name: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  template_sid: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  template_name: string | null;

  @Column({ type: 'uuid', nullable: true })
  contact_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  conversation_id: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contact_name: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  phone_number: string | null;

  /** sent | failed | skipped */
  @Column({ type: 'varchar', length: 20, default: 'sent' })
  status: string;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  message_sid: string | null;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
