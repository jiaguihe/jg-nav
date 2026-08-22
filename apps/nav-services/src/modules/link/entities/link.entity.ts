import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 沿用旧库 link 表，新增列为升级字段（synchronize 安全 ADD COLUMN，不动旧数据）
 */
@Entity('link')
export class Link {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  url: string;

  @Column()
  description: string;

  @Column({ type: 'int', nullable: true })
  groupId: number | null;

  @Column({ type: 'int', default: 0 })
  sort: number;

  @Column({ type: 'bool', default: false })
  pinned: boolean;

  @Column({ type: 'int', default: 0 })
  clickCount: number;

  @Column({ type: 'datetime', nullable: true })
  lastClickAt: Date | null;
}
