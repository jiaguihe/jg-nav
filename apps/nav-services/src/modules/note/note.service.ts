import {
  Injectable,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note)
    private noteRepository: Repository<Note>
  ) {}

  findMine(userId: number): Promise<Note[]> {
    return this.noteRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' }
    });
  }

  async create(userId: number, dto: CreateNoteDto): Promise<Note> {
    const note = this.noteRepository.create({ userId, ...dto });
    return this.noteRepository.save(note);
  }

  async findOneOwned(id: number, userId: number): Promise<Note> {
    const note = await this.noteRepository.findOne({ where: { id } });
    if (!note) {
      throw new NotFoundException('便签不存在');
    }
    if (note.userId !== userId) {
      throw new ForbiddenException('无权操作他人的便签');
    }
    return note;
  }

  async update(id: number, userId: number, dto: UpdateNoteDto): Promise<Note> {
    const note = await this.findOneOwned(id, userId);
    note.content = dto.content;
    return this.noteRepository.save(note);
  }

  async remove(id: number, userId: number): Promise<void> {
    const note = await this.findOneOwned(id, userId);
    await this.noteRepository.remove(note);
  }
}
