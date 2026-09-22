import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { User } from './user.entity';
import { ChemicalSample } from './chemical-sample.entity';

@Entity('sample_likes')
export class SampleLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  sample_id: number;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ChemicalSample, (sample) => sample.likes, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'sample_id' })
  sample: ChemicalSample;
}
