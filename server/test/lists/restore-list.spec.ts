import { NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  FakeElementListRepository,
  FakeListVersionRepository,
} from '../helpers/fakes';
import { ChangeType } from '../../src/domain/enums/change-type';
import { RestoreListUseCase } from '../../src/use-cases/lists/restore-list';
import { AddElementUseCase } from '../../src/use-cases/lists/add-element';

describe('RestoreListUseCase', () => {
  let fakeLists: FakeElementListRepository;
  let fakeVersions: FakeListVersionRepository;
  let useCase: RestoreListUseCase;

  beforeEach(() => {
    fakeLists = new FakeElementListRepository();
    fakeVersions = new FakeListVersionRepository();
    useCase = new RestoreListUseCase(fakeLists, fakeVersions);
  });

  it('restaura o estado de uma versão anterior criando uma nova versão', async () => {
    const userId = randomUUID();
    const state = await fakeLists.create(userId, 'Lista', [
      { id: randomUUID(), content: 'C' },
    ]);
    await fakeLists.commit(userId, state.id, {
      elements: [{ id: randomUUID(), content: 'D' }],
      changeType: ChangeType.ADD,
      description: 'Elemento adicionado.',
    });

    const targetElements = [{ id: randomUUID(), content: 'C' }];
    fakeVersions.seed(userId, state.id, {
      versionNumber: 1,
      changeType: ChangeType.CREATE,
      description: 'Lista criada.',
      createdAt: new Date(),
      elements: targetElements,
    });

    const result = await useCase.execute(userId, state.id, 1);

    expect(result.restoredFromVersion).toBe(1);
    expect(result.version).toBe(3);
    expect(result.elements.map((e) => e.content)).toEqual(['C']);
  });

  it('permite continuar editando a partir do estado restaurado', async () => {
    const userId = randomUUID();
    const state = await fakeLists.create(userId, 'Lista', [
      { id: randomUUID(), content: 'Y' },
    ]);
    const targetElements = [{ id: randomUUID(), content: 'X' }];
    fakeVersions.seed(userId, state.id, {
      versionNumber: 1,
      changeType: ChangeType.CREATE,
      description: 'Lista criada.',
      createdAt: new Date(),
      elements: targetElements,
    });

    const restored = await useCase.execute(userId, state.id, 1);
    expect(restored.version).toBe(2);
    expect(restored.elements.map((e) => e.content)).toEqual(['X']);

    const add = new AddElementUseCase(fakeLists);
    const after = await add.execute(userId, state.id, { content: 'Z' });

    expect(after.version).toBe(3);
    expect(after.elements.map((e) => e.content)).toEqual(['X', 'Z']);
  });

  it('lança NotFoundException para versão inexistente', async () => {
    const userId = randomUUID();
    const state = await fakeLists.create(userId, 'Lista', []);

    await expect(useCase.execute(userId, state.id, 99)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lança NotFoundException para lista inexistente', async () => {
    await expect(
      useCase.execute(randomUUID(), randomUUID(), 1),
    ).rejects.toThrow(NotFoundException);
  });
});