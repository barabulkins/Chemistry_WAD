import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { SampleLike } from './sample-like.entity';

@Entity('chemical_samples')
export class ChemicalSample {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: string;

  @Column({ type: 'text', nullable: true })
  image_url: string;

  @Column({ type: 'text', nullable: true })
  video_url: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  impurities_percent: number;

  @Column({ type: 'integer', nullable: true })
  gas_volume: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  formation_date: Date;

  @Column()
  creator_id: number;

  @ManyToOne(() => User, (user) => user.samples, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @OneToMany(() => SampleLike, (like) => like.sample)
  likes: SampleLike[];
}
