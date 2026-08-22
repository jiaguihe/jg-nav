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
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ResponseDto } from '../../common/response.dto';

@ApiTags('待办')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  @ApiOperation({ summary: '获取本人待办列表' })
  async findMine(@Req() req: Request) {
    return ResponseDto.success(await this.todoService.findMine(req.user!.id));
  }

  @Post()
  @ApiOperation({ summary: '新增待办' })
  async create(@Req() req: Request, @Body() dto: CreateTodoDto) {
    const todo = await this.todoService.create(req.user!.id, dto);
    return ResponseDto.success(todo, '创建成功');
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新待办（勾选/编辑）' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateTodoDto
  ) {
    const todo = await this.todoService.update(+id, req.user!.id, dto);
    return ResponseDto.success(todo, '更新成功');
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除待办' })
  async remove(@Req() req: Request, @Param('id') id: string) {
    await this.todoService.remove(+id, req.user!.id);
    return ResponseDto.success(null, '删除成功');
  }
}
