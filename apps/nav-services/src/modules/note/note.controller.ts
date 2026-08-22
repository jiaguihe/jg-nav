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
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ResponseDto } from '../../common/response.dto';

@ApiTags('便签')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Get()
  @ApiOperation({ summary: '获取本人便签列表' })
  async findMine(@Req() req: Request) {
    return ResponseDto.success(await this.noteService.findMine(req.user!.id));
  }

  @Post()
  @ApiOperation({ summary: '新增便签' })
  async create(@Req() req: Request, @Body() dto: CreateNoteDto) {
    const note = await this.noteService.create(req.user!.id, dto);
    return ResponseDto.success(note, '创建成功');
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新便签内容' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto
  ) {
    const note = await this.noteService.update(+id, req.user!.id, dto);
    return ResponseDto.success(note, '已保存');
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除便签' })
  async remove(@Req() req: Request, @Param('id') id: string) {
    await this.noteService.remove(+id, req.user!.id);
    return ResponseDto.success(null, '删除成功');
  }
}
