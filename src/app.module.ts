import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Restaurant, MenuItem, Comment, NutritionItem } from './entities';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { CommentsModule } from './comments/comments.module';
import { CaptchaModule } from './captcha/captcha.module';
import { NutritionModule } from './nutrition/nutrition.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '3306'),
      username: process.env.DB_USERNAME ?? 'serveruser',
      password: process.env.DB_PASSWORD ?? 'gorgonzola7!',
      database: process.env.DB_DATABASE ?? 'serverside',
      entities: [User, Restaurant, MenuItem, Comment, NutritionItem],
      synchronize: false,
    }),
    AuthModule, UsersModule, RestaurantsModule,
    CommentsModule, CaptchaModule, NutritionModule,
  ],
})
export class AppModule {}
