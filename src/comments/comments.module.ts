import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../entities';
import { CaptchaModule } from '../captcha/captcha.module';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), CaptchaModule],
  providers: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}
