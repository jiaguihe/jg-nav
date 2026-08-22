import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { TakeawayOrderService } from './takeaway-order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ResponseDto } from '../../common/response.dto';

@ApiTags('外卖-点单')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('takeaway/orders')
export class TakeawayOrderController {
  constructor(private readonly orderService: TakeawayOrderService) {}

  @Get()
  @ApiOperation({ summary: '获取某店铺的点单历史' })
  async findByShop(
    @Req() req: Request,
    @Query('shopId') shopId: string
  ) {
    return ResponseDto.success(
      await this.orderService.findByShop(+shopId, req.user!.id)
    );
  }

  @Post()
  @ApiOperation({ summary: '记一笔点单' })
  async create(@Req() req: Request, @Body() dto: CreateOrderDto) {
    const order = await this.orderService.create(req.user!.id, dto);
    return ResponseDto.success(order, '记录成功');
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新点单记录' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto
  ) {
    const order = await this.orderService.update(+id, req.user!.id, dto);
    return ResponseDto.success(order, '更新成功');
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除点单记录' })
  async remove(@Req() req: Request, @Param('id') id: string) {
    await this.orderService.remove(+id, req.user!.id);
    return ResponseDto.success(null, '删除成功');
  }
}
