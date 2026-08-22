import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn
} from 'typeorm';

/** 纪念日/倒计时 */
@Entity('memorial_day')
export class MemorialDay {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'date' })
  targetDate: string;

  /** 每年重复（生日/周年类） */
  @Column({ type: 'bool', default: false })
  repeatYearly: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
