import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { FakeElementListRepository } from '../helpers/fakes';
import { ReorderElementUseCase } from '../../src/use-cases/lists/reorder-element';

describe('ReorderElementUseCase', () => {
  let fake: FakeElementListRepository;
  let useCase: ReorderElementUseCase;

  beforeEach(() => {
    fake = new FakeElementListRepository();
    useCase = new ReorderElementUseCase(fake);
  });

  it('move o elemento para a posição informada (0-indexada)', async () => {
    const userId = randomUUID();
    const a = { id: randomUUID(), content: 'A' };
    const b = { id: randomUUID(), content: 'B' };
    const c = { id: randomUUID(), content: 'C' };
    const state = await fake.create(userId, 'Lista', [a, b, c]);

    const result = await useCase.execute(userId, state.id, a.id, {
      newPosition: 2,
    });

    expect(result.version).toBe(2);
    expect(result.moved).toEqual(a);
    expect(result.elements.map((e) => e.content)).toEqual(['B', 'C', 'A']);
  });

  it('lança BadRequestException para posição fora do range', async () => {
    const userId = randomUUID();
    const a = { id: randomUUID(), content: 'A' };
    const state = await fake.create(userId, 'Lista', [a]);

    await expect(
      useCase.execute(userId, state.id, a.id, { newPosition: 5 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('lança NotFoundException para elemento inexistente', async () => {
    const userId = randomUUID();
    const state = await fake.create(userId, 'Lista', []);

    await expect(
      useCase.execute(userId, state.id, randomUUID(), {
        newPosition: 0,
      }),
    ).rejects.toThrow(NotFoundException);
  });
});