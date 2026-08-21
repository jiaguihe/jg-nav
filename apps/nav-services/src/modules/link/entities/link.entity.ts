import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 沿用旧库 link 表结构，勿改字段
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
}
