import {
  Injectable,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LinkGroup } from './entities/link-group.entity';
import { Link } from './entities/link.entity';

@Injectable()
export class LinkGroupService {
  constructor(
    @InjectRepository(LinkGroup)
    private groupRepository: Repository<LinkGroup>,
    @InjectRepository(Link)
    private linkRepository: Repository<Link>
  ) {}

  findMine(userId: number): Promise<LinkGroup[]> {
    return this.groupRepository.find({
      where: { userId },
      order: { sort: 'ASC', id: 'ASC' }
    });
  }

  async create(userId: number, name: string): Promise<LinkGroup> {
    const count = await this.groupRepository.count({ where: { userId } });
    const group = this.groupRepository.create({ userId, name, sort: count });
    return this.groupRepository.save(group);
  }

  async findOneOwned(id: number, userId: number): Promise<LinkGroup> {
    const group = await this.groupRepository.findOne({ where: { id } });
    if (!group) {
      throw new NotFoundException('分组不存在');
    }
    if (group.userId !== userId) {
      throw new ForbiddenException('无权操作他人的分组');
    }
    return group;
  }

  async update(id: number, userId: number, dto: { name?: string; sort?: number }) {
    const group = await this.findOneOwned(id, userId);
    Object.assign(group, dto);
    return this.groupRepository.save(group);
  }

  /** 删除分组：组内收藏移回未分组，不删收藏本身 */
  async remove(id: number, userId: number): Promise<void> {
    const group = await this.findOneOwned(id, userId);
    await this.linkRepository.update({ groupId: id, userId }, { groupId: null });
    await this.groupRepository.remove(group);
  }
}
