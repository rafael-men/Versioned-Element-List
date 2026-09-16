import { NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { FakeListVersionRepository } from '../helpers/fakes';
import { ChangeType } from '../../src/domain/enums/change-type';
import { GetListVersionUseCase } from '../../src/use-cases/lists/get-list-version';

describe('GetListVersionUseCase', () => {
  let fake: FakeListVersionRepository;
  let useCase: GetListVersionUseCase;

  beforeEach(() => {
    fake = new FakeListVersionRepository();
    useCase = new GetListVersionUseCase(fake);
  });

  it('retorna o snapshot completo de uma versão', async () => {
    const userId = randomUUID();
    const listId = randomUUID();
    const elements = [
      { id: randomUUID(), content: 'A' },
      { id: randomUUID(), content: 'B' },
    ];
    fake.seed(userId, listId, {
      versionNumber: 3,
      changeType: ChangeType.RESTORE,
      description: 'Lista restaurada para a versão 1.',
      createdAt: new Date(),
      elements,
    });

    const result = await useCase.execute(userId, listId, 3);

    expect(result.versionNumber).toBe(3);
    expect(result.elements).toEqual(elements);
    expect(result.description).toContain('restaurada');
  });

  it('lança NotFoundException para versão inexistente', async () => {
    const userId = randomUUID();
    const listId = randomUUID();
    fake.seedDefault(userId, listId, []);

    await expect(useCase.execute(userId, listId, 99)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lança NotFoundException para lista inexistente', async () => {
    await expect(
      useCase.execute(randomUUID(), randomUUID(), 1),
    ).rejects.toThrow(NotFoundException);
  });
});
