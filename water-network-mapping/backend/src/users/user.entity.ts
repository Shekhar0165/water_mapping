import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  CITY_PLANNER = 'city_planner',
  WORKER = 'worker',
  VIEWER = 'viewer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.WORKER,
  })
  role: UserRole;

  @Column({ type: 'varchar', nullable: true })
  cityId: string | null;

  @Column({ type: 'varchar', nullable: true })
  hashedRefreshToken: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
