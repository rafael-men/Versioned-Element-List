import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

const normalizeEmail = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class LoginDto {
  @ApiProperty({
    description: 'E-mail cadastrado do usuário.',
    example: 'usuario@exemplo.com',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'O campo email é obrigatório.' })
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  @Transform(normalizeEmail)
  email!: string;

  @ApiProperty({
    description: 'Senha do usuário.',
    example: 'Senha123',
    minLength: 6,
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'O campo password é obrigatório.' })
  @IsString({ message: 'O campo password deve ser uma string.' })
  password!: string;
}
