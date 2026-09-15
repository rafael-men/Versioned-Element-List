import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';

export class UpdateListDto {
  @IsString({ message: 'O campo name deve ser uma string.' })
  @Length(1, 120, {
    message: 'O campo name deve ter entre 1 e 120 caracteres.',
  })
  @IsNotEmpty({ message: 'O campo name é obrigatório.' })
  name!: string;

  @IsArray({ message: 'O campo elements deve ser um array.' })
  @ArrayMaxSize(500, {
    message: 'A lista não pode conter mais de 500 elementos.',
  })
  @IsString({ each: true, message: 'Cada elemento deve ser uma string.' })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((item: unknown) =>
          typeof item === 'string' ? item.trim() : item,
        )
      : value,
  )
  elements!: string[];
}
