import {
  Injectable,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TakeawayShop } from './entities/takeaway-shop.entity';
import { TakeawayOrder } from './entities/takeaway-order.entity';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import type { ShopTag, TakeawayShopVO } from '@jg/api-types';

const VALID_TAGS: ShopTag[] = ['good', 'bad', 'wishlist', 'reorder'];

@Injectable()
export class TakeawayShopService {
  constructor(
    @InjectRepository(TakeawayShop)
    private shopRepository: Repository<TakeawayShop>,
    @InjectRepository(TakeawayOrder)
    private orderRepository: Repository<TakeawayOrder>
  ) {}

  /** 列表 + 点单聚合统计（次数 / 总花费 / 最近点单） */
  async findMineWithStats(userId: number): Promise<TakeawayShopVO[]> {
    const { entities, raw } = await this.shopRepository
      .createQueryBuilder('shop')
      .leftJoin(TakeawayOrder, 'o', 'o.shopId = shop.id')
      .where('shop.userId = :userId', { userId })
      .groupBy('shop.id')
      .orderBy('shop.updatedAt', 'DESC')
      .addSelect('COUNT(o.id)', 'orderCount')
      .addSelect('COALESCE(SUM(o.amount), 0)', 'totalAmount')
      .addSelect('MAX(o.orderedAt)', 'lastOrderedAt')
      .getRawAndEntities();

    const statsById = new Map<number, Record<string, unknown>>(
      raw.map((row) => [Number(row.shop_id), row])
    );
    return entities.map((shop) => {
      const stats = statsById.get(shop.id) ?? {};
      return {
        ...this.toVO(shop),
        orderCount: Number(stats.orderCount ?? 0),
        totalAmount: Number(stats.totalAmount ?? 0),
        lastOrderedAt: this.formatDateOnly(stats.lastOrderedAt)
      };
    });
  }

  /** MAX(date) 经驱动返回本地时区 Date，手动拼 YYYY-MM-DD 避免 toISOString 的 UTC 偏移丢一天 */
  private formatDateOnly(value: unknown): string | null {
    if (!value) return null;
    const d = new Date(value as string);
    if (Number.isNaN(d.getTime())) return null;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  async findOneOwned(id: number, userId: number): Promise<TakeawayShop> {
    const shop = await this.shopRepository.findOne({ where: { id } });
    if (!shop) {
      throw new NotFoundException('店铺不存在');
    }
    if (shop.userId !== userId) {
      throw new ForbiddenException('无权操作他人的店铺');
    }
    return shop;
  }

  async create(userId: number, dto: CreateShopDto): Promise<TakeawayShopVO> {
    const shop = this.shopRepository.create({
      userId,
      name: dto.name,
      platform: dto.platform ?? 'other',
      category: dto.category ?? '',
      score: dto.score ?? 3,
      tags: this.joinTags(dto.tags),
      remark: dto.remark ?? ''
    });
    return this.toVO(await this.shopRepository.save(shop));
  }

  async update(id: number, userId: number, dto: UpdateShopDto): Promise<TakeawayShopVO> {
    const shop = await this.findOneOwned(id, userId);
    if (dto.name !== undefined) shop.name = dto.name;
    if (dto.platform !== undefined) shop.platform = dto.platform;
    if (dto.category !== undefined) shop.category = dto.category;
    if (dto.score !== undefined) shop.score = dto.score;
    if (dto.tags !== undefined) shop.tags = this.joinTags(dto.tags);
    if (dto.remark !== undefined) shop.remark = dto.remark;
    return this.toVO(await this.shopRepository.save(shop));
  }

  /** 删除店铺：连带删除其点单记录 */
  async remove(id: number, userId: number): Promise<void> {
    const shop = await this.findOneOwned(id, userId);
    await this.orderRepository.delete({ shopId: id, userId });
    await this.shopRepository.remove(shop);
  }

  private joinTags(tags?: string[]): string {
    if (!tags?.length) return '';
    return tags.filter((tag) => VALID_TAGS.includes(tag as ShopTag)).join(',');
  }

  private toVO(shop: TakeawayShop): TakeawayShopVO {
    return {
      id: shop.id,
      userId: shop.userId,
      name: shop.name,
      platform: shop.platform as TakeawayShopVO['platform'],
      category: shop.category,
      score: shop.score,
      tags: shop.tags ? (shop.tags.split(',') as ShopTag[]) : [],
      remark: shop.remark,
      orderCount: 0,
      totalAmount: 0,
      lastOrderedAt: null,
      createdAt: shop.createdAt.toISOString(),
      updatedAt: shop.updatedAt.toISOString()
    };
  }
}
