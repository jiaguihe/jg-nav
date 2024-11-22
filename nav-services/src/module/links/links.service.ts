import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Link } from './entities/link.entity';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link) // 注入 Link 实体的 Repository
    private readonly linkRepository: Repository<Link>,
  ) {}

  // 创建新的 link
  async create(createLinkDto: CreateLinkDto): Promise<Link> {
    const link = this.linkRepository.create(createLinkDto); // 使用 DTO 创建实体
    return await this.linkRepository.save(link);
  }

  // 查找所有的 links
  async findAll(): Promise<Link[]> {
    return await this.linkRepository.find(); // 查找所有记录
  }

  // 查找单个 link
  async findOne(id: number): Promise<Link> {
    const link = await this.linkRepository.findOne({ where: { id } }); // 查找指定 id 的 link
    return link;
  }

  // 更新现有的 link
  async update(id: number, updateLinkDto: UpdateLinkDto): Promise<Link> {
    return await this.linkRepository.save({
      id: id,
      ...updateLinkDto,
    });
  }

  // 删除指定 id 的 link
  async remove(id: number): Promise<DeleteResult> {
    return await this.linkRepository.delete(id);
  }
}
