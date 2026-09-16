import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChangeType } from '../../domain/enums/change-type';
import {
  ELEMENT_LIST_REPOSITORY,
  type ElementListRepository,
} from '../ports/element-list.repository';
import { sanitizeText } from '../common/sanitize-text';

export interface ElementPatchInput {
  id: string;
  content?: string;
}

export interface PatchListInput {
  name?: string;
  elements?: ElementPatchInput[];
}

@Injectable()
export class PatchListUseCase {
  constructor(
    @Inject(ELEMENT_LIST_REPOSITORY)
    private readonly lists: ElementListRepository,
  ) {}

  async execute(userId: string, listId: string, input: PatchListInput) {
    const state = await this.lists.findState(userId, listId);
    if (!state) {
      throw new NotFoundException('Lista não encontrada.');
    }

    const nameChanged = input.name !== undefined;
    const safeName =
      input.name !== undefined ? sanitizeText(input.name, 'nome') : undefined;
    const elements = [...state.elements];
    const patches = input.elements ?? [];

    for (const patch of patches) {
      const index = elements.findIndex((e) => e.id === patch.id);
      if (index === -1) {
        throw new NotFoundException(
          `Elemento ${patch.id} não encontrado na lista.`,
        );
      }
      if (patch.content !== undefined) {
        const content = sanitizeText(patch.content, 'conteúdo');
        elements[index] = { ...elements[index], content };
      }
    }

    if (!nameChanged && patches.length === 0) {
      throw new BadRequestException(
        'Nenhuma alteração fornecida. Informe ao menos name ou elements.',
      );
    }

    const hasElementEdits = patches.length > 0;
    const updated = await this.lists.commit(userId, listId, {
      name: safeName,
      elements,
      changeType: hasElementEdits ? ChangeType.EDIT : ChangeType.RENAME,
      description: hasElementEdits
        ? `${patches.length} elemento(s) editado(s)${nameChanged ? ' e nome atualizado' : ''}.`
        : 'Nome da lista atualizado.',
    });

    if (!updated) {
      throw new NotFoundException('Lista não encontrada.');
    }
    return updated;
  }
}
