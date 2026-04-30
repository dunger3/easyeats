import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MenuItem } from './menu-item.entity';
import { Comment } from './comment.entity';

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn() 
  restaurant_id: number;

  @Column() 
  name: string;

  @Column() 
  address: string;

  @Column({ nullable: true }) 
  image_filename: string;

  @OneToMany(() => MenuItem, (m) => m.restaurant) menuItems: MenuItem[];
  @OneToMany(() => Comment, (c) => c.restaurant) comments: Comment[];
}
