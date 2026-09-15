import { NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { FakeElementListRepository } from '../helpers/fakes';
import { EditElementUseCase } from '../../src/use-cases/lists/edit-element';

describe('EditElementUseCase', () => {
  let fake: FakeElementListRepository;
  let useCase: EditElementUseCase;

  beforeEach(() => {
    fake = new FakeElementListRepository();
    useCase = new EditElementUseCase(fake);
  });

  it('edita o conteúdo do elemento e incrementa a versão', async () => {
    const userId = randomUUID();
    const target = { id: randomUUID(), content: 'Antes' };
    const state = await fake.create(userId, 'Lista', [
      target,
      { id: randomUUID(), content: 'Intacto' },
    ]);

    const result = await useCase.execute(userId, state.id, target.id, {
      content: 'Depois',
    });

    expect(result.version).toBe(2);
    expect(result.elements).toEqual([
      { id: target.id, content: 'Depois' },
      { id: expect.any(String) as string, content: 'Intacto' },
    ]);
  });

  it('lança NotFoundException para elemento inexistente', async () => {
    const userId = randomUUID();
    const state = await fake.create(userId, 'Lista', []);

    await expect(
      useCase.execute(userId, state.id, randomUUID(), { content: 'X' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('lança NotFoundException para lista inexistente', async () => {
    await expect(
      useCase.execute(randomUUID(), randomUUID(), randomUUID(), {
        content: 'X',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});