import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemorialDay } from './entities/memorial-day.entity';
import { MemorialService } from './memorial.service';
import { MemorialController } from './memorial.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MemorialDay])],
  controllers: [MemorialController],
  providers: [MemorialService]
})
export class MemorialModule {}
