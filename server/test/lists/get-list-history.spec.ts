import { NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { FakeListVersionRepository } from '../helpers/fakes';
import { ChangeType } from '../../src/domain/enums/change-type';
import { GetListHistoryUseCase } from '../../src/use-cases/lists/get-list-history';

describe('GetListHistoryUseCase', () => {
  let fake: FakeListVersionRepository;
  let useCase: GetListHistoryUseCase;

  beforeEach(() => {
    fake = new FakeListVersionRepository();
    useCase = new GetListHistoryUseCase(fake);
  });

  it('retorna o histórico em ordem decrescente de versão', async () => {
    const userId = randomUUID();
    const listId = randomUUID();
    fake.seed(userId, listId, {
      versionNumber: 1,
      changeType: ChangeType.CREATE,
      description: 'Lista criada.',
      createdAt: new Date(),
      elements: [{ id: randomUUID(), content: 'A' }],
    });
    fake.seed(userId, listId, {
      versionNumber: 2,
      changeType: ChangeType.ADD,
      description: 'Elemento adicionado.',
      createdAt: new Date(),
      elements: [
        { id: randomUUID(), content: 'A' },
        { id: randomUUID(), content: 'B' },
      ],
    });

    const result = await useCase.execute(userId, listId);

    expect(result.listId).toBe(listId);
    expect(result.currentVersion).toBe(2);
    expect(result.versions.map((v) => v.versionNumber)).toEqual([2, 1]);
    expect(result.versions[0]).toMatchObject({
      changeType: ChangeType.ADD,
      elementCount: 2,
    });
  });

  it('lança NotFoundException para lista inexistente', async () => {
    await expect(useCase.execute(randomUUID(), randomUUID())).rejects.toThrow(
      NotFoundException,
    );
  });
});
