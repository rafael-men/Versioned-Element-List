import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';

export class ElementPatchDto {
  @ApiProperty({
    description: 'UUID do elemento a ser alterado.',
    example: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
  })
  @IsUUID('4', { message: 'O campo id deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'O campo id é obrigatório.' })
  id!: string;

  @ApiPropertyOptional({
    description: 'Novo conteúdo do elemento.',
    example: 'conteúdo atualizado',
    minLength: 1,
    maxLength: 2000,
  })
  @IsOptional()
  @IsString({ message: 'O campo content deve ser uma string.' })
  @Length(1, 2000, {
    message: 'O campo content deve ter entre 1 e 2000 caracteres.',
  })
  content?: string;
}

export class PatchListDto {
  @ApiPropertyOptional({
    description: 'Novo nome da lista.',
    example: 'Lista renomeada',
    minLength: 1,
    maxLength: 120,
  })
  @IsOptional()
  @IsString({ message: 'O campo name deve ser uma string.' })
  @Length(1, 120, {
    message: 'O campo name deve ter entre 1 e 120 caracteres.',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Elementos com o conteúdo a ser alterado.',
    type: [ElementPatchDto],
  })
  @IsOptional()
  @IsArray({ message: 'O campo elements deve ser um array.' })
  @ValidateNested({ each: true })
  @Type(() => ElementPatchDto)
  elements?: ElementPatchDto[];
}
