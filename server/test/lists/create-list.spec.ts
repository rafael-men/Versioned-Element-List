import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { FakeElementListRepository } from '../helpers/fakes';
import { CreateListUseCase } from '../../src/use-cases/lists/create-list';

describe('CreateListUseCase', () => {
  let fake: FakeElementListRepository;
  let useCase: CreateListUseCase;

  beforeEach(() => {
    fake = new FakeElementListRepository();
    useCase = new CreateListUseCase(fake);
  });

  it('cria uma lista com versão inicial 1 e sem elementos', async () => {
    const result = await useCase.execute(randomUUID(), { name: 'Minha lista' });

    expect(result.version).toBe(1);
    expect(result.name).toBe('Minha lista');
    expect(result.elements).toEqual([]);
  });

  it('gera ids únicos para os elementos iniciais', async () => {
    const result = await useCase.execute(randomUUID(), {
      name: 'Compras',
      elements: ['Arroz', 'Feijão'],
    });

    expect(result.elements).toHaveLength(2);
    expect(result.elements[0]).toMatchObject({ content: 'Arroz' });
    expect(result.elements[1]).toMatchObject({ content: 'Feijão' });
    expect(result.elements[0].id).not.toBe(result.elements[1].id);
  });

  it('escapa HTML no nome e nos elementos iniciais', async () => {
    const result = await useCase.execute(randomUUID(), {
      name: '<b>Compras</b>',
      elements: ['<script>alert(1)</script>', 'Feijão & Arroz'],
    });

    expect(result.name).toBe('&lt;b&gt;Compras&lt;/b&gt;');
    expect(result.elements.map((e) => e.content)).toEqual([
      '&lt;script&gt;alert(1)&lt;/script&gt;',
      'Feijão &amp; Arroz',
    ]);
  });

  it('rejeita caracteres de controle no nome', async () => {
    await expect(
      useCase.execute(randomUUID(), { name: 'Compras\u0000' }),
    ).rejects.toThrow(BadRequestException);
  });
});
