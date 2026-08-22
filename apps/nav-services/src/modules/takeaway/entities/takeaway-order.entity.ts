import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn
} from 'typeorm';

/** 单次点单记录（点单历史时间线的来源） */
@Entity('takeaway_order')
export class TakeawayOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  shopId: number;

  @Column({ type: 'date' })
  orderedAt: string;

  @Column({ type: 'varchar', length: 500, default: '' })
  items: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'tinyint' })
  score: number;

  @Column({ type: 'varchar', length: 500, default: '' })
  note: string;

  @CreateDateColumn()
  createdAt: Date;
}
