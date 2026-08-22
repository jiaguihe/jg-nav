import {
  Injectable,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemorialDay } from './entities/memorial-day.entity';
import { CreateMemorialDto } from './dto/create-memorial.dto';
import { UpdateMemorialDto } from './dto/update-memorial.dto';

@Injectable()
export class MemorialService {
  constructor(
    @InjectRepository(MemorialDay)
    private memorialRepository: Repository<MemorialDay>
  ) {}

  findMine(userId: number): Promise<MemorialDay[]> {
    return this.memorialRepository.find({
      where: { userId },
      order: { targetDate: 'ASC' }
    });
  }

  async create(userId: number, dto: CreateMemorialDto): Promise<MemorialDay> {
    const memorial = this.memorialRepository.create({
      userId,
      name: dto.name,
      targetDate: dto.targetDate.slice(0, 10),
      repeatYearly: dto.repeatYearly ?? false
    });
    return this.memorialRepository.save(memorial);
  }

  async findOneOwned(id: number, userId: number): Promise<MemorialDay> {
    const memorial = await this.memorialRepository.findOne({ where: { id } });
    if (!memorial) {
      throw new NotFoundException('纪念日不存在');
    }
    if (memorial.userId !== userId) {
      throw new ForbiddenException('无权操作他人的纪念日');
    }
    return memorial;
  }

  async update(
    id: number,
    userId: number,
    dto: UpdateMemorialDto
  ): Promise<MemorialDay> {
    const memorial = await this.findOneOwned(id, userId);
    Object.assign(memorial, {
      ...dto,
      ...(dto.targetDate !== undefined ? { targetDate: dto.targetDate.slice(0, 10) } : {})
    });
    return this.memorialRepository.save(memorial);
  }

  async remove(id: number, userId: number): Promise<void> {
    const memorial = await this.findOneOwned(id, userId);
    await this.memorialRepository.remove(memorial);
  }
}
