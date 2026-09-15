import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ElementList } from './element-list';
import { ChangeType } from '../enums/change-type';

export interface ElementSnapshot {
  id: string;
  content: string;
}

@Entity('list_versions')
export class ListVersion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'version_number', type: 'int' })
  versionNumber!: number;

  @Column({ type: 'enum', enum: ChangeType })
  changeType!: ChangeType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string | null;

  @Column({ type: 'json' })
  elements!: ElementSnapshot[];

  @ManyToOne(() => ElementList, (list) => list.versions, {
    onDelete: 'CASCADE',
  })
  list!: ElementList;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
