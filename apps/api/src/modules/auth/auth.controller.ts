import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    return { message: 'Register endpoint - TODO' };
  }

  @Post('login')
  async login(@Body() body: any) {
    return { message: 'Login endpoint - TODO' };
  }
}
