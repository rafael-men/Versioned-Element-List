import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { FakeElementListRepository } from '../helpers/fakes';
import { PatchListUseCase } from '../../src/use-cases/lists/patch-list';

describe('PatchListUseCase', () => {
  let fake: FakeElementListRepository;
  let useCase: PatchListUseCase;

  beforeEach(() => {
    fake = new FakeElementListRepository();
    useCase = new PatchListUseCase(fake);
  });

  it('renomeia a lista sem alterar os elementos', async () => {
    const userId = randomUUID();
    const state = await fake.create(userId, 'Antiga', [
      { id: randomUUID(), content: 'A' },
    ]);

    const result = await useCase.execute(userId, state.id, {
      name: 'Nova',
    });

    expect(result.name).toBe('Nova');
    expect(result.version).toBe(2);
    expect(result.elements.map((e) => e.content)).toEqual(['A']);
  });

  it('edita apenas os elementos informados', async () => {
    const userId = randomUUID();
    const [a, b] = [
      { id: randomUUID(), content: 'A' },
      { id: randomUUID(), content: 'B' },
    ];
    const state = await fake.create(userId, 'Lista', [a, b]);

    const result = await useCase.execute(userId, state.id, {
      elements: [{ id: a.id, content: 'A1' }],
    });

    expect(result.elements).toEqual([
      { id: a.id, content: 'A1' },
      b,
    ]);
    expect(result.version).toBe(2);
  });

  it('lança BadRequestException quando nenhuma alteração é informada', async () => {
    const userId = randomUUID();
    const state = await fake.create(userId, 'Lista', []);

    await expect(
      useCase.execute(userId, state.id, {}),
    ).rejects.toThrow(BadRequestException);
  });

  it('lança NotFoundException para elemento inexistente', async () => {
    const userId = randomUUID();
    const state = await fake.create(userId, 'Lista', []);

    await expect(
      useCase.execute(userId, state.id, {
        elements: [{ id: randomUUID(), content: 'X' }],
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('lança NotFoundException para lista inexistente', async () => {
    await expect(
      useCase.execute(randomUUID(), randomUUID(), { name: 'X' }),
    ).rejects.toThrow(NotFoundException);
  });
});