import {
  Controller, Post, Param, Body, ParseIntPipe, BadRequestException,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CaptchaService } from '../captcha/captcha.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('restaurants/:restaurantId/comments')
export class CommentsController {
  constructor(private svc: CommentsService, private captcha: CaptchaService) {}

  @Post()
  create(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() dto: CreateCommentDto,
  ) {
    if (!this.captcha.verify(dto.captcha_token, dto.captcha_code))
      throw new BadRequestException('Incorrect CAPTCHA. Please try again.');
    return this.svc.create(restaurantId, dto.name, dto.comment);
  }
}
