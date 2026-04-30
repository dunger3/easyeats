import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { Restaurant } from './restaurant.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn() 
  comment_id: number;

  @Column() 
  restaurant_id: number;

  @Column() 
  name: string;

  @Column('text') 
  comment: string;

  @CreateDateColumn() 
  created_at: Date;

  @ManyToOne(() => Restaurant, (r) => r.comments)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
