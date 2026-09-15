import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user';
import { ListVersion } from './list-version';

@Entity('element_lists')
export class ElementList {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  name!: string;

  @Column({ name: 'current_version', type: 'int', default: 0 })
  currentVersion!: number;

  @ManyToOne(() => User, (user) => user.lists, { onDelete: 'CASCADE' })
  user!: User;

  @OneToMany(() => ListVersion, (version) => version.list)
  versions!: ListVersion[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
