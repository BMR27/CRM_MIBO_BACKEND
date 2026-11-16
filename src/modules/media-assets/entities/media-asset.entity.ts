import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('media_assets')
export class MediaAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  tenant_id: string | null;

  @Column({ type: 'varchar', length: 100 })
  mime_type: string;

  @Column({ type: 'bytea' })
  data: Buffer;

  @CreateDateColumn()
  created_at: Date;
}
