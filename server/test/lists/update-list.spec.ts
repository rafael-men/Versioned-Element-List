import { BadRequestException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { FakeElementListRepository } from '../helpers/fakes';
import { UpdateListUseCase } from '../../src/use-cases/lists/update-list';

describe('UpdateListUseCase', () => {
  let fake: FakeElementListRepository;
  let useCase: UpdateListUseCase;

  beforeEach(() => {
    fake = new FakeElementListRepository();
    useCase = new UpdateListUseCase(fake);
  });

  it('substitui totalmente nome e elementos e incrementa a versão', async () => {
    const userId = randomUUID();
    const state = await fake.create(userId, 'Antiga', [
      { id: randomUUID(), content: 'A' },
      { id: randomUUID(), content: 'B' },
    ]);

    const result = await useCase.execute(userId, state.id, {
      name: 'Nova',
      elements: ['C', 'D', 'E'],
    });

    expect(result.name).toBe('Nova');
    expect(result.version).toBe(2);
    expect(result.elements.map((e) => e.content)).toEqual(['C', 'D', 'E']);
  });

  it('lança NotFoundException quando a lista não existe', async () => {
    await expect(
      useCase.execute(randomUUID(), randomUUID(), {
        name: 'Nova',
        elements: [],
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('escapa HTML no nome e nos elementos', async () => {
    const userId = randomUUID();
    const state = await fake.create(userId, 'Antiga', []);

    const result = await useCase.execute(userId, state.id, {
      name: '<h1>Nova</h1>',
      elements: ['<script>x</script>', 'a & b'],
    });

    expect(result.name).toBe('&lt;h1&gt;Nova&lt;/h1&gt;');
    expect(result.elements.map((e) => e.content)).toEqual([
      '&lt;script&gt;x&lt;/script&gt;',
      'a &amp; b',
    ]);
  });

  it('rejeita caracteres de controle no nome', async () => {
    const userId = randomUUID();
    const state = await fake.create(userId, 'Antiga', []);

    await expect(
      useCase.execute(userId, state.id, {
        name: 'Nova\u0007',
        elements: [],
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
