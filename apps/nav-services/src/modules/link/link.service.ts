import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Link } from './entities/link.entity';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { ReorderLinksDto } from './dto/reorder-links.dto';

@Injectable()
export class LinkService {
  constructor(
    @InjectRepository(Link)
    private linkRepository: Repository<Link>
  ) {}

  /** 查询本人收藏：置顶优先，其次手动排序，最后按创建顺序 */
  findMine(userId: number): Promise<Link[]> {
    return this.linkRepository.find({
      where: { userId },
      order: { pinned: 'DESC', sort: 'ASC', id: 'ASC' }
    });
  }

  async create(userId: number, dto: CreateLinkDto): Promise<Link> {
    const link = this.linkRepository.create({ ...dto, userId });
    return this.linkRepository.save(link);
  }

  /** 取本人记录，不存在或非本人直接 404/403 */
  async findOneOwned(id: number, userId: number): Promise<Link> {
    const link = await this.linkRepository.findOne({ where: { id } });
    if (!link) {
      throw new NotFoundException('收藏不存在');
    }
    if (link.userId !== userId) {
      throw new ForbiddenException('无权操作他人的收藏');
    }
    return link;
  }

  async update(id: number, userId: number, dto: UpdateLinkDto): Promise<Link> {
    const link = await this.findOneOwned(id, userId);
    Object.assign(link, dto);
    return this.linkRepository.save(link);
  }

  async remove(id: number, userId: number): Promise<void> {
    const link = await this.findOneOwned(id, userId);
    await this.linkRepository.remove(link);
  }

  /** 拖拽排序：批量写入新序号与分组 */
  async reorder(userId: number, dto: ReorderLinksDto): Promise<void> {
    if (!dto.items.length) return;
    const ids = dto.items.map((item) => item.id);
    // 先确认全部归属本人，避免越权改排序
    const owned = await this.linkRepository.find({
      where: { id: In(ids), userId }
    });
    const ownedIds = new Set(owned.map((link) => link.id));
    await Promise.all(
      dto.items
        .filter((item) => ownedIds.has(item.id))
        .map((item) =>
          this.linkRepository.update(item.id, {
            sort: item.sort,
            ...(item.groupId !== undefined ? { groupId: item.groupId } : {})
          })
        )
    );
  }

  /** 点击打卡：计数 +1 并刷新最近使用时间（失败静默，不影响打开网页） */
  async registerClick(id: number, userId: number): Promise<void> {
    const link = await this.findOneOwned(id, userId);
    link.clickCount += 1;
    link.lastClickAt = new Date();
    await this.linkRepository.save(link);
  }
}
