import { BadRequestException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { FakeElementListRepository } from '../helpers/fakes';
import { AddElementUseCase } from '../../src/use-cases/lists/add-element';

describe('AddElementUseCase', () => {
  let fake: FakeElementListRepository;
  let useCase: AddElementUseCase;

  beforeEach(() => {
    fake = new FakeElementListRepository();
    useCase = new AddElementUseCase(fake);
  });

  it('adiciona um elemento ao final e incrementa a versão', async () => {
    const userId = randomUUID();
    const state = await fake.create(userId, 'Lista', [
      { id: randomUUID(), content: 'A' },
    ]);

    const result = await useCase.execute(userId, state.id, {
      content: 'B',
    });

    expect(result.version).toBe(2);
    expect(result.elements.map((e) => e.content)).toEqual(['A', 'B']);
    expect(result.added).toMatchObject({ content: 'B' });
    expect(result.added.id).toEqual(expect.any(String));
  });

  it('adiciona o primeiro elemento em uma lista vazia', async () => {
    const userId = randomUUID();
    const state = await fake.create(userId, 'Lista', []);

    const result = await useCase.execute(userId, state.id, {
      content: 'Único',
    });

    expect(result.elements).toHaveLength(1);
    expect(result.version).toBe(2);
  });

  it('lança NotFoundException para lista inexistente', async () => {
    await expect(
      useCase.execute(randomUUID(), randomUUID(), { content: 'X' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('escapa HTML no conteúdo para prevenir XSS', async () => {
    const userId = randomUUID();
    const state = await fake.create(userId, 'Lista', []);

    const result = await useCase.execute(userId, state.id, {
      content: '<script>alert(1)</script>',
    });

    expect(result.added.content).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('rejeita caracteres de controle no conteúdo', async () => {
    const userId = randomUUID();
    const state = await fake.create(userId, 'Lista', []);

    await expect(
      useCase.execute(userId, state.id, { content: 'abc\u0000def' }),
    ).rejects.toThrow(BadRequestException);
  });
});
