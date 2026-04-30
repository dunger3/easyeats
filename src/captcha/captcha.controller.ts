import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { CaptchaService } from './captcha.service';

@Controller('captcha')
export class CaptchaController {
  constructor(private svc: CaptchaService) {}

  @Get()
  generate(@Res() res: Response) {
    res.set({ 'Cache-Control': 'no-store' });
    res.json(this.svc.generate());
  }
}
