import { BadRequestException } from '@nestjs/common';
import {
  escapeHtml,
  hasControlCharacters,
} from '../../infrastructure/security/sanitization';

export function sanitizeText(value: string, fieldName = 'texto'): string {
  const trimmed = value.trim();

  if (hasControlCharacters(trimmed)) {
    throw new BadRequestException(
      `O campo ${fieldName} contém caracteres não permitidos.`,
    );
  }

  return escapeHtml(trimmed);
}
