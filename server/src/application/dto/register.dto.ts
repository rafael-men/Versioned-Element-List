import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

const normalizeEmail = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class RegisterDto {
  @ApiProperty({
    description: 'E-mail do usuário. Será normalizado para minúsculas.',
    example: 'usuario@exemplo.com',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'O campo email é obrigatório.' })
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  @Length(3, 255, {
    message: 'O e-mail deve ter entre 3 e 255 caracteres.',
  })
  @Transform(normalizeEmail)
  email!: string;

  @ApiProperty({
    description:
      'Senha do usuário. Deve ter no mínimo 6 caracteres, ao menos um número e uma letra maiúscula e uma minúscula.',
    example: 'Senha123',
    minLength: 6,
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'O campo password é obrigatório.' })
  @IsString({ message: 'O campo password deve ser uma string.' })
  @Length(6, 255, {
    message: 'A senha deve ter no mínimo 6 caracteres.',
  })
  @Matches(/[0-9]/, {
    message: 'A senha deve conter ao menos um número.',
  })
  @Matches(/[A-Z]/, {
    message: 'A senha deve conter ao menos uma letra maiúscula.',
  })
  @Matches(/[a-z]/, {
    message: 'A senha deve conter ao menos uma letra minúscula.',
  })
  password!: string;
}
