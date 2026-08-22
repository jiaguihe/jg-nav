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
import { MemorialService } from './memorial.service';
import { CreateMemorialDto } from './dto/create-memorial.dto';
import { UpdateMemorialDto } from './dto/update-memorial.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ResponseDto } from '../../common/response.dto';

@ApiTags('纪念日')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('memorials')
export class MemorialController {
  constructor(private readonly memorialService: MemorialService) {}

  @Get()
  @ApiOperation({ summary: '获取本人纪念日列表' })
  async findMine(@Req() req: Request) {
    return ResponseDto.success(
      await this.memorialService.findMine(req.user!.id)
    );
  }

  @Post()
  @ApiOperation({ summary: '新增纪念日' })
  async create(@Req() req: Request, @Body() dto: CreateMemorialDto) {
    const memorial = await this.memorialService.create(req.user!.id, dto);
    return ResponseDto.success(memorial, '创建成功');
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新纪念日' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateMemorialDto
  ) {
    const memorial = await this.memorialService.update(+id, req.user!.id, dto);
    return ResponseDto.success(memorial, '更新成功');
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除纪念日' })
  async remove(@Req() req: Request, @Param('id') id: string) {
    await this.memorialService.remove(+id, req.user!.id);
    return ResponseDto.success(null, '删除成功');
  }
}
