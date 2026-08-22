import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/** 收藏分组 */
@Entity('link_group')
export class LinkGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  name: string;

  @Column({ type: 'int', default: 0 })
  sort: number;
}
