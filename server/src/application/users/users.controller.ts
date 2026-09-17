import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterUseCase } from '../../use-cases/user/register';
import { LoginUseCase } from '../../use-cases/user/login';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class UsersController {
  constructor(
    private readonly registerUc: RegisterUseCase,
    private readonly loginUc: LoginUseCase,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar novo usuário',
    description:
      'Cria uma conta de usuário com e-mail e senha. A senha deve conter no mínimo 6 caracteres, ao menos um número e uma letra maiúscula.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuário registrado.',
  })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  register(@Body() dto: RegisterDto) {
    return this.registerUc.execute(dto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Autenticar usuário',
    description:
      'Realiza login com e-mail e senha e retorna um token de acesso.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: 'Login realizado com sucesso.',
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  login(@Body() dto: LoginDto) {
    return this.loginUc.execute(dto);
  }
}
