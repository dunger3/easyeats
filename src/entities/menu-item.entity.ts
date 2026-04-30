import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@Entity('menu')
export class MenuItem {
  @PrimaryGeneratedColumn() 
  menu_id: number;

  @Column() 
  restaurant_id: number;

  @Column() 
  name: string;

  @Column('decimal', { precision: 10, scale: 2 }) 
  price: number;

  @ManyToOne(() => Restaurant, (r) => r.menuItems)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
