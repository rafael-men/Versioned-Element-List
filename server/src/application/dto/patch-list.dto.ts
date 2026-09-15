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
  @IsUUID('4', { message: 'O campo id deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'O campo id é obrigatório.' })
  id!: string;

  @IsOptional()
  @IsString({ message: 'O campo content deve ser uma string.' })
  @Length(1, 2000, {
    message: 'O campo content deve ter entre 1 e 2000 caracteres.',
  })
  content?: string;
}

export class PatchListDto {
  @IsOptional()
  @IsString({ message: 'O campo name deve ser uma string.' })
  @Length(1, 120, {
    message: 'O campo name deve ter entre 1 e 120 caracteres.',
  })
  name?: string;

  @IsOptional()
  @IsArray({ message: 'O campo elements deve ser um array.' })
  @ValidateNested({ each: true })
  @Type(() => ElementPatchDto)
  elements?: ElementPatchDto[];
}
