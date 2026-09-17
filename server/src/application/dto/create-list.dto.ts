import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateListDto {
  @ApiProperty({
    description: 'Nome da lista.',
    example: 'Minha lista',
    minLength: 1,
    maxLength: 120,
  })
  @IsString({ message: 'O campo name deve ser uma string.' })
  @Length(1, 120, {
    message: 'O campo name deve ter entre 1 e 120 caracteres.',
  })
  @IsNotEmpty({ message: 'O campo name é obrigatório.' })
  name!: string;

  @ApiPropertyOptional({
    description: 'Elementos iniciais da lista (máximo de 500).',
    example: ['item 1', 'item 2'],
    maxItems: 500,
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'O campo elements deve ser um array.' })
  @ArrayMaxSize(500, {
    message: 'A lista não pode conter mais de 500 elementos iniciais.',
  })
  @IsString({
    each: true,
    message: 'Cada elemento inicial deve ser uma string.',
  })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((item: unknown) =>
          typeof item === 'string' ? item.trim() : item,
        )
      : value,
  )
  elements?: string[];
}
