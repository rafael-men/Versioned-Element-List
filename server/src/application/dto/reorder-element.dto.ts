import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ReorderElementDto {
  @ApiProperty({
    description: 'Nova posição do elemento na lista (índice começando em 0).',
    example: 2,
    minimum: 0,
    type: Number,
  })
  @Type(() => Number)
  @IsInt({ message: 'O campo newPosition deve ser um número inteiro.' })
  @Min(0, {
    message: 'O campo newPosition deve ser maior ou igual a 0.',
  })
  newPosition!: number;
}
