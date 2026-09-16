import { randomUUID } from 'node:crypto';
import { FakeElementListRepository } from '../helpers/fakes';
import { GetAllListsUseCase } from '../../src/use-cases/lists/get-all-lists';

describe('GetAllListsUseCase', () => {
  let fake: FakeElementListRepository;
  let useCase: GetAllListsUseCase;

  beforeEach(() => {
    fake = new FakeElementListRepository();
    useCase = new GetAllListsUseCase(fake);
  });

  it('retorna apenas as listas do usuário', async () => {
    await fake.create(randomUUID(), 'Compras', [
      { id: randomUUID(), content: 'A' },
    ]);
    await fake.create('usuário', 'Tarefas', [
      { id: randomUUID(), content: 'X' },
      { id: randomUUID(), content: 'Y' },
    ]);
    await fake.create('usuário', 'Viagem', []);

    const result = await useCase.execute('usuário');

    expect(result).toHaveLength(2);
    expect(result.map((l) => l.name).sort()).toEqual(['Tarefas', 'Viagem']);
    expect(result[0]).toMatchObject({
      version: 1,
      elementCount: 2,
    });
  });

  it('retorna lista vazia quando o usuário não tem listas', async () => {
    const result = await useCase.execute('usuário');
    expect(result).toEqual([]);
  });
});
