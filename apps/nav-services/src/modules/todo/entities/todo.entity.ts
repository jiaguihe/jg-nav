import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn
} from 'typeorm';

/** 待办事项 */
@Entity('todo')
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ type: 'varchar', length: 200 })
  content: string;

  @Column({ type: 'bool', default: false })
  done: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
