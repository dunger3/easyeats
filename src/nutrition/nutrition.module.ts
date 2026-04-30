import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionItem } from '../entities';
import { NutritionService } from './nutrition.service';
import { NutritionController } from './nutrition.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NutritionItem])],
  providers: [NutritionService],
  controllers: [NutritionController],
})
export class NutritionModule {}
