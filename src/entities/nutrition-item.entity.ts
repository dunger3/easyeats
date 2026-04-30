import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@Entity('nutrition')
export class NutritionItem {
  @PrimaryGeneratedColumn() 
  nutrition_id: number;

  @Column() 
  restaurant_id: number;

  @Column() 
  item_name: string;

  @Column({ nullable: true }) 
  calories: number;

  @Column('decimal', { precision: 6, scale: 1, nullable: true }) 
  protein: number;

  @Column({ nullable: true }) 
  sodium: number;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
