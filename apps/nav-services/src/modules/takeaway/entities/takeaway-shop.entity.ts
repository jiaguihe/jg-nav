import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

/** 外卖店铺档案（tags 列存逗号分隔的 ShopTag） */
@Entity('takeaway_shop')
export class TakeawayShop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  name: string;

  /** meituan / eleme / other */
  @Column({ type: 'varchar', length: 20, default: 'other' })
  platform: string;

  @Column({ type: 'varchar', length: 30, default: '' })
  category: string;

  /** 整体印象分 1-5 */
  @Column({ type: 'tinyint', default: 3 })
  score: number;

  @Column({ type: 'varchar', length: 100, default: '' })
  tags: string;

  @Column({ type: 'varchar', length: 500, default: '' })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
