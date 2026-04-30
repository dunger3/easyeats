import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type UserRole = 'customer' | 'admin';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn() 
  user_id: number;

  @Column({ unique: true }) 
  email: string;

  @Column() 
  password_hash: string;

  @Column() 
  name: string;
  
  @Column({ default: 'customer' }) 
  role: UserRole;
}
