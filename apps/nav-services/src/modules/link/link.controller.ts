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
import { LinkService } from './link.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { ReorderLinksDto } from './dto/reorder-links.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ResponseDto } from '../../common/response.dto';

@ApiTags('收藏')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('links')
export class LinkController {
  constructor(private readonly linkService: LinkService) {}

  @Get()
  @ApiOperation({ summary: '获取本人收藏列表' })
  async findMine(@Req() req: Request) {
    return ResponseDto.success(
      await this.linkService.findMine(req.user!.id)
    );
  }

  @Post()
  @ApiOperation({ summary: '新增收藏' })
  async create(@Req() req: Request, @Body() dto: CreateLinkDto) {
    const link = await this.linkService.create(req.user!.id, dto);
    return ResponseDto.success(link, '创建成功');
  }

  @Patch('reorder')
  @ApiOperation({ summary: '批量排序（拖拽后提交）' })
  async reorder(@Req() req: Request, @Body() dto: ReorderLinksDto) {
    await this.linkService.reorder(req.user!.id, dto);
    return ResponseDto.success(null, '排序已保存');
  }

  @Post(':id/click')
  @ApiOperation({ summary: '点击打卡（常用统计）' })
  async click(@Req() req: Request, @Param('id') id: string) {
    await this.linkService.registerClick(+id, req.user!.id);
    return ResponseDto.success(null);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新收藏' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateLinkDto
  ) {
    const link = await this.linkService.update(+id, req.user!.id, dto);
    return ResponseDto.success(link, '更新成功');
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除收藏' })
  async remove(@Req() req: Request, @Param('id') id: string) {
    await this.linkService.remove(+id, req.user!.id);
    return ResponseDto.success(null, '删除成功');
  }
}
