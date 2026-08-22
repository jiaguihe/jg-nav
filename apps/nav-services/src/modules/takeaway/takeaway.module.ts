import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TakeawayShop } from './entities/takeaway-shop.entity';
import { TakeawayOrder } from './entities/takeaway-order.entity';
import { TakeawayShopService } from './takeaway-shop.service';
import { TakeawayShopController } from './takeaway-shop.controller';
import { TakeawayOrderService } from './takeaway-order.service';
import { TakeawayOrderController } from './takeaway-order.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TakeawayShop, TakeawayOrder])],
  controllers: [TakeawayShopController, TakeawayOrderController],
  providers: [TakeawayShopService, TakeawayOrderService]
})
export class TakeawayModule {}
