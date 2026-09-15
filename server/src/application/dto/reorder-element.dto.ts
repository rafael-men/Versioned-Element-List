import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ReorderElementDto {
  @Type(() => Number)
  @IsInt({ message: 'O campo newPosition deve ser um número inteiro.' })
  @Min(0, {
    message: 'O campo newPosition deve ser maior ou igual a 0.',
  })
  newPosition!: number;
}
