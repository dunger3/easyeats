import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private svc: AuthService) {}

  @HttpCode(200) 
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.svc.login(dto); 
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.svc.register(dto); 
  }
}
