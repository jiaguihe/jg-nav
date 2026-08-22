import {
  Injectable,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>
  ) {}

  findMine(userId: number): Promise<Todo[]> {
    return this.todoRepository.find({
      where: { userId },
      order: { done: 'ASC', id: 'DESC' }
    });
  }

  async create(userId: number, dto: CreateTodoDto): Promise<Todo> {
    const todo = this.todoRepository.create({ userId, ...dto });
    return this.todoRepository.save(todo);
  }

  async findOneOwned(id: number, userId: number): Promise<Todo> {
    const todo = await this.todoRepository.findOne({ where: { id } });
    if (!todo) {
      throw new NotFoundException('待办不存在');
    }
    if (todo.userId !== userId) {
      throw new ForbiddenException('无权操作他人的待办');
    }
    return todo;
  }

  async update(id: number, userId: number, dto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.findOneOwned(id, userId);
    Object.assign(todo, dto);
    return this.todoRepository.save(todo);
  }

  async remove(id: number, userId: number): Promise<void> {
    const todo = await this.findOneOwned(id, userId);
    await this.todoRepository.remove(todo);
  }
}
