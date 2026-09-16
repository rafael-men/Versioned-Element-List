import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

const normalizeEmail = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class LoginDto {
  @IsNotEmpty({ message: 'O campo email é obrigatório.' })
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  @Transform(normalizeEmail)
  email!: string;

  @IsNotEmpty({ message: 'O campo password é obrigatório.' })
  @IsString({ message: 'O campo password deve ser uma string.' })
  password!: string;
}
