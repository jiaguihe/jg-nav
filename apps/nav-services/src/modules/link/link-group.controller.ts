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
import { LinkGroupService } from './link-group.service';
import { CreateLinkGroupDto } from './dto/create-link-group.dto';
import { UpdateLinkGroupDto } from './dto/update-link-group.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ResponseDto } from '../../common/response.dto';

@ApiTags('收藏分组')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('link-groups')
export class LinkGroupController {
  constructor(private readonly groupService: LinkGroupService) {}

  @Get()
  @ApiOperation({ summary: '获取本人分组列表' })
  async findMine(@Req() req: Request) {
    return ResponseDto.success(
      await this.groupService.findMine(req.user!.id)
    );
  }

  @Post()
  @ApiOperation({ summary: '新增分组' })
  async create(@Req() req: Request, @Body() dto: CreateLinkGroupDto) {
    const group = await this.groupService.create(req.user!.id, dto.name);
    return ResponseDto.success(group, '创建成功');
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新分组' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateLinkGroupDto
  ) {
    const group = await this.groupService.update(+id, req.user!.id, dto);
    return ResponseDto.success(group, '更新成功');
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除分组（组内收藏移回未分组）' })
  async remove(@Req() req: Request, @Param('id') id: string) {
    await this.groupService.remove(+id, req.user!.id);
    return ResponseDto.success(null, '删除成功');
  }
}
