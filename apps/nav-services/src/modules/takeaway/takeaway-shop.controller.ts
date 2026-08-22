import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { TakeawayShopService } from './takeaway-shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ResponseDto } from '../../common/response.dto';

@ApiTags('外卖-店铺')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('takeaway/shops')
export class TakeawayShopController {
  constructor(private readonly shopService: TakeawayShopService) {}

  @Get()
  @ApiOperation({ summary: '获取本人店铺列表（含点单统计）' })
  async findMine(@Req() req: Request) {
    return ResponseDto.success(
      await this.shopService.findMineWithStats(req.user!.id)
    );
  }

  @Post()
  @ApiOperation({ summary: '新增店铺' })
  async create(@Req() req: Request, @Body() dto: CreateShopDto) {
    const shop = await this.shopService.create(req.user!.id, dto);
    return ResponseDto.success(shop, '创建成功');
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新店铺' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateShopDto
  ) {
    const shop = await this.shopService.update(+id, req.user!.id, dto);
    return ResponseDto.success(shop, '更新成功');
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除店铺（连带点单记录）' })
  async remove(@Req() req: Request, @Param('id') id: string) {
    await this.shopService.remove(+id, req.user!.id);
    return ResponseDto.success(null, '删除成功');
  }
}
