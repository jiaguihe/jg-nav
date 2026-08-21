import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 沿用旧库 user 表结构，勿改字段
 */
@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;
}
