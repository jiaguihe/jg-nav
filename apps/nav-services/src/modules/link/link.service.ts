import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Link } from './entities/link.entity';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';

@Injectable()
export class LinkService {
  constructor(
    @InjectRepository(Link)
    private linkRepository: Repository<Link>
  ) {}

  /** 查询本人收藏 */
  findMine(userId: number): Promise<Link[]> {
    return this.linkRepository.find({
      where: { userId },
      order: { id: 'ASC' }
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
}
