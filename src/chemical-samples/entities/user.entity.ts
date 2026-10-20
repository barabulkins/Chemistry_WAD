import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ChemicalSample } from './chemical-sample.entity';
import { SampleLike } from './sample-like.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  username: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string;

  @OneToMany(() => ChemicalSample, (sample) => sample.creator)
  samples: ChemicalSample[];

  @OneToMany(() => SampleLike, (like) => like.user)
  likes: SampleLike[];
}
