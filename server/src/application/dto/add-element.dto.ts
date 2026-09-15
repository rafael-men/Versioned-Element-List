import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class AddElementDto {
  @IsString({ message: 'O campo content deve ser uma string.' })
  @Length(1, 2000, {
    message: 'O campo content deve ter entre 1 e 2000 caracteres.',
  })
  @IsNotEmpty({ message: 'O campo content é obrigatório.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  content!: string;
}
