import {
  Injectable,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TakeawayOrder } from './entities/takeaway-order.entity';
import { TakeawayShop } from './entities/takeaway-shop.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class TakeawayOrderService {
  constructor(
    @InjectRepository(TakeawayOrder)
    private orderRepository: Repository<TakeawayOrder>,
    @InjectRepository(TakeawayShop)
    private shopRepository: Repository<TakeawayShop>
  ) {}

  findByShop(shopId: number, userId: number): Promise<TakeawayOrder[]> {
    return this.orderRepository.find({
      where: { shopId, userId },
      order: { orderedAt: 'DESC', id: 'DESC' }
    });
  }

  async create(userId: number, dto: CreateOrderDto): Promise<TakeawayOrder> {
    await this.assertShopOwned(dto.shopId, userId);
    const order = this.orderRepository.create({
      userId,
      shopId: dto.shopId,
      orderedAt: dto.orderedAt ?? new Date().toISOString().slice(0, 10),
      items: dto.items ?? '',
      amount: dto.amount ?? 0,
      score: dto.score,
      note: dto.note ?? ''
    });
    const saved = await this.orderRepository.save(order);
    // 新点单会刷新店铺 updatedAt，让列表"最近记录"排序保持新鲜
    await this.shopRepository.update(dto.shopId, { updatedAt: new Date() });
    return saved;
  }

  async findOneOwned(id: number, userId: number): Promise<TakeawayOrder> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('点单记录不存在');
    }
    if (order.userId !== userId) {
      throw new ForbiddenException('无权操作他人的点单记录');
    }
    return order;
  }

  async update(id: number, userId: number, dto: UpdateOrderDto): Promise<TakeawayOrder> {
    const order = await this.findOneOwned(id, userId);
    if (dto.orderedAt !== undefined) order.orderedAt = dto.orderedAt;
    if (dto.items !== undefined) order.items = dto.items;
    if (dto.amount !== undefined) order.amount = dto.amount;
    if (dto.score !== undefined) order.score = dto.score;
    if (dto.note !== undefined) order.note = dto.note;
    return this.orderRepository.save(order);
  }

  async remove(id: number, userId: number): Promise<void> {
    const order = await this.findOneOwned(id, userId);
    await this.orderRepository.remove(order);
  }

  private async assertShopOwned(shopId: number, userId: number): Promise<void> {
    const shop = await this.shopRepository.findOne({ where: { id: shopId } });
    if (!shop) {
      throw new NotFoundException('店铺不存在');
    }
    if (shop.userId !== userId) {
      throw new ForbiddenException('无权操作他人的店铺');
    }
  }
}
