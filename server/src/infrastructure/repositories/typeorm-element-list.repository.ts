import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElementList } from '../../domain/entities/element-list';
import { ListVersion } from '../../domain/entities/list-version';
import { User } from '../../domain/entities/user';
import { ChangeType } from '../../domain/enums/change-type';
import { ElementItem, ListState, ListSummary } from '../../domain/models/list';
import {
  ElementListRepository,
  ListChange,
} from '../../use-cases/ports/element-list.repository';

@Injectable()
export class TypeOrmElementListRepository implements ElementListRepository {
  constructor(
    @InjectRepository(ElementList)
    private readonly listRepo: Repository<ElementList>,
    @InjectRepository(ListVersion)
    private readonly versionRepo: Repository<ListVersion>,
  ) {}

  async create(
    userId: string,
    name: string,
    initialElements: ElementItem[],
  ): Promise<ListState> {
    const list = this.listRepo.create();
    list.name = name;
    list.currentVersion = 1;
    list.user = { id: userId } as User;
    await this.listRepo.save(list);

    await this.insertVersion(list, {
      elements: initialElements,
      changeType: ChangeType.CREATE,
      description: 'Lista criada.',
    });

    return this.toState(list, initialElements);
  }

  async findState(userId: string, listId: string): Promise<ListState | null> {
    const list = await this.listRepo.findOne({
      where: { id: listId, user: { id: userId } },
      relations: { versions: true },
      order: { versions: { versionNumber: 'DESC' } },
    });

    if (!list?.versions[0]) {
      return null;
    }
    return this.toState(list, list.versions[0].elements);
  }

  async findAllSummary(userId: string): Promise<ListSummary[]> {
    const lists = await this.listRepo.find({
      where: { user: { id: userId } },
      relations: { versions: true },
      order: { versions: { versionNumber: 'DESC' } },
    });

    return lists.map((list) => ({
      id: list.id,
      name: list.name,
      version: list.currentVersion,
      elementCount: list.versions[0]?.elements.length ?? 0,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
    }));
  }

  async commit(
    userId: string,
    listId: string,
    change: ListChange,
  ): Promise<ListState | null> {
    const list = await this.listRepo.findOne({
      where: { id: listId, user: { id: userId } },
    });
    if (!list) {
      return null;
    }

    if (change.name !== undefined) {
      list.name = change.name;
    }
    list.currentVersion += 1;
    await this.listRepo.save(list);

    await this.insertVersion(list, change);

    return this.toState(list, change.elements);
  }

  async delete(userId: string, listId: string): Promise<boolean> {
    const list = await this.listRepo.findOne({
      where: { id: listId, user: { id: userId } },
    });
    if (!list) {
      return false;
    }
    await this.listRepo.remove(list);
    return true;
  }

  private async insertVersion(
    list: ElementList,
    change: {
      elements: ElementItem[];
      changeType: ChangeType;
      description: string;
    },
  ) {
    const version = this.versionRepo.create({
      versionNumber: list.currentVersion,
      changeType: change.changeType,
      description: change.description,
      elements: change.elements,
      list,
    });
    await this.versionRepo.save(version);
  }

  private toState(list: ElementList, elements: ElementItem[]): ListState {
    return {
      id: list.id,
      name: list.name,
      version: list.currentVersion,
      elements,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
    };
  }
}
