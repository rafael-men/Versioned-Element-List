import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElementList } from '../../domain/entities/element-list';
import { ListVersion } from '../../domain/entities/list-version';
import { ListHistory, ListVersionDetail } from '../../domain/models/list';
import { ListVersionRepository } from '../../use-cases/ports/list-version.repository';

@Injectable()
export class TypeOrmListVersionRepository implements ListVersionRepository {
  constructor(
    @InjectRepository(ElementList)
    private readonly listRepo: Repository<ElementList>,
    @InjectRepository(ListVersion)
    private readonly versionRepo: Repository<ListVersion>,
  ) {}

  async findHistory(
    userId: string,
    listId: string,
  ): Promise<ListHistory | null> {
    const list = await this.listRepo.findOne({
      where: { id: listId, user: { id: userId } },
    });
    if (!list) {
      return null;
    }

    const versions = await this.versionRepo.find({
      where: { list: { id: listId } },
      order: { versionNumber: 'DESC' },
    });

    return {
      listId: list.id,
      currentVersion: list.currentVersion,
      versions: versions.map((version) => ({
        versionNumber: version.versionNumber,
        changeType: version.changeType,
        description: version.description,
        createdAt: version.createdAt,
        elementCount: version.elements.length,
      })),
    };
  }

  async findByVersion(
    userId: string,
    listId: string,
    versionNumber: number,
  ): Promise<ListVersionDetail | null> {
    const list = await this.listRepo.findOne({
      where: { id: listId, user: { id: userId } },
    });
    if (!list) {
      return null;
    }

    const version = await this.versionRepo.findOne({
      where: { list: { id: listId }, versionNumber },
    });
    if (!version) {
      return null;
    }

    return {
      versionNumber: version.versionNumber,
      changeType: version.changeType,
      description: version.description,
      createdAt: version.createdAt,
      elements: version.elements,
    };
  }
}
