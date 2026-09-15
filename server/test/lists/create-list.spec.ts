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
});