import { NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { FakeElementListRepository } from '../helpers/fakes';
import { DeleteListUseCase } from '../../src/use-cases/lists/delete-list';

describe('DeleteListUseCase', () => {
  let fake: FakeElementListRepository;
  let useCase: DeleteListUseCase;

  beforeEach(() => {
    fake = new FakeElementListRepository();
    useCase = new DeleteListUseCase(fake);
  });

  it('remove a lista do usuário', async () => {
    const userId = randomUUID();
    const state = await fake.create(userId, 'Lista', []);

    const result = await useCase.execute(userId, state.id);

    expect(result).toEqual({ removed: true });
    await expect(useCase.execute(userId, state.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lança NotFoundException para lista inexistente', async () => {
    await expect(
      useCase.execute(randomUUID(), randomUUID()),
    ).rejects.toThrow(NotFoundException);
  });

  it('lança NotFoundException para lista de outro usuário', async () => {
    const state = await fake.create('dono', 'Lista', []);

    await expect(useCase.execute('outro', state.id)).rejects.toThrow(
      NotFoundException,
    );
  });
});