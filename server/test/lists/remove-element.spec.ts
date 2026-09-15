import { NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { FakeElementListRepository } from '../helpers/fakes';
import { RemoveElementUseCase } from '../../src/use-cases/lists/remove-element';

describe('RemoveElementUseCase', () => {
  let fake: FakeElementListRepository;
  let useCase: RemoveElementUseCase;

  beforeEach(() => {
    fake = new FakeElementListRepository();
    useCase = new RemoveElementUseCase(fake);
  });

  it('remove o elemento e incrementa a versão', async () => {
    const userId = randomUUID();
    const target = { id: randomUUID(), content: 'Removido' };
    const state = await fake.create(userId, 'Lista', [
      target,
      { id: randomUUID(), content: 'Fica' },
    ]);

    const result = await useCase.execute(userId, state.id, target.id);

    expect(result.version).toBe(2);
    expect(result.removed).toMatchObject({ content: 'Removido' });
    expect(result.elements.map((e) => e.content)).toEqual(['Fica']);
  });

  it('lança NotFoundException para elemento inexistente', async () => {
    const userId = randomUUID();
    const state = await fake.create(userId, 'Lista', []);

    await expect(
      useCase.execute(userId, state.id, randomUUID()),
    ).rejects.toThrow(NotFoundException);
  });

  it('lança NotFoundException para lista inexistente', async () => {
    await expect(
      useCase.execute(randomUUID(), randomUUID(), randomUUID()),
    ).rejects.toThrow(NotFoundException);
  });
});