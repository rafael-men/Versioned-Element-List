import { Body, Controller, Post } from '@nestjs/common';
import { RegisterUseCase } from '../../use-cases/user/register';
import { LoginUseCase } from '../../use-cases/user/login';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

@Controller('auth')
export class UsersController {
  constructor(
    private readonly registerUc: RegisterUseCase,
    private readonly loginUc: LoginUseCase,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.registerUc.execute(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.loginUc.execute(dto);
  }
}
