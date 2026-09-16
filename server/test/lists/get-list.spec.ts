import { NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { FakeElementListRepository } from '../helpers/fakes';
import { GetListUseCase } from '../../src/use-cases/lists/get-list.use-case';

describe('GetListUseCase', () => {
  let fake: FakeElementListRepository;
  let useCase: GetListUseCase;

  beforeEach(() => {
    fake = new FakeElementListRepository();
    useCase = new GetListUseCase(fake);
  });

  it('retorna o estado atual da lista', async () => {
    const userId = randomUUID();
    const state = await fake.create(userId, 'Lista', [
      { id: randomUUID(), content: 'A' },
    ]);

    const result = await useCase.execute(userId, state.id);

    expect(result.id).toBe(state.id);
    expect(result.name).toBe('Lista');
    expect(result.version).toBe(1);
    expect(result.elements[0].content).toBe('A');
  });

  it('lança NotFoundException quando a lista não existe', async () => {
    await expect(useCase.execute(randomUUID(), randomUUID())).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lança NotFoundException para lista de outro usuário', async () => {
    const state = await fake.create('dono', 'Lista', []);

    await expect(useCase.execute('outro', state.id)).rejects.toThrow(
      NotFoundException,
    );
  });
});
