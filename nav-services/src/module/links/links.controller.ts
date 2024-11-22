import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { ResponseDto } from 'src/globals/response.dto';

@ApiTags('地址管理')
@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  // 创建地址
  @Post()
  @ApiOperation({ summary: '新增一个地址' })
  @ApiResponse({ status: 201, description: '创建地址成功' })
  @ApiResponse({ status: 400, description: '请求参数不正确' })
  @ApiResponse({ status: 500, description: '服务器错误' })
  async create(
    @Body() createLinkDto: CreateLinkDto,
  ): Promise<ResponseDto<CreateLinkDto>> {
    const link = await this.linksService.create(createLinkDto);
    return new ResponseDto(0, '创建地址成功', link);
  }

  // 获取所有地址
  @Get()
  @ApiOperation({ summary: '获取所有地址列表' })
  @ApiResponse({ status: 200, description: '返回所有地址列表' })
  @ApiResponse({ status: 500, description: '服务器错误' })
  async findAll(): Promise<ResponseDto<CreateLinkDto[]>> {
    const links = await this.linksService.findAll();
    return new ResponseDto(0, '获取地址列表成功', links);
  }

  // 获取单个地址
  @Get(':id')
  @ApiOperation({ summary: '获取指定 ID 的地址信息' })
  @ApiResponse({ status: 200, description: '返回指定地址信息' })
  @ApiResponse({ status: 404, description: '地址未找到' })
  @ApiResponse({ status: 500, description: '服务器错误' })
  async findOne(@Param('id') id: string): Promise<ResponseDto<CreateLinkDto>> {
    const link = await this.linksService.findOne(+id);
    if (!link) {
      return new ResponseDto(-1, '地址未找到', null);
    }
    return new ResponseDto(0, '获取地址成功', link);
  }

  // 更新地址
  @Patch(':id')
  @ApiOperation({ summary: '更新指定 ID 的地址信息' })
  @ApiResponse({ status: 200, description: '地址更新成功' })
  @ApiResponse({ status: 400, description: '请求参数不正确' })
  @ApiResponse({ status: 404, description: '地址未找到' })
  @ApiResponse({ status: 500, description: '服务器错误' })
  async update(
    @Param('id') id: string,
    @Body() updateLinkDto: UpdateLinkDto,
  ): Promise<ResponseDto<CreateLinkDto>> {
    const updatedLink = await this.linksService.update(+id, updateLinkDto);
    if (!updatedLink) {
      return new ResponseDto(-1, '地址未找到', null);
    }
    return new ResponseDto(0, '地址更新成功', updatedLink);
  }

  // 删除地址
  @Delete(':id')
  @ApiOperation({ summary: '删除指定 ID 的地址' })
  @ApiResponse({ status: 200, description: '地址删除成功' })
  @ApiResponse({ status: 404, description: '地址未找到' })
  @ApiResponse({ status: 500, description: '服务器错误' })
  async remove(@Param('id') id: string): Promise<ResponseDto<null>> {
    const result = await this.linksService.remove(+id);
    if (!result) {
      return new ResponseDto(-1, '地址未找到', null);
    }
    return new ResponseDto(0, '地址删除成功', null);
  }
}
