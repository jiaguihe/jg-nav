import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Link } from './entities/link.entity';
import { LinkGroup } from './entities/link-group.entity';
import { LinkService } from './link.service';
import { LinkController } from './link.controller';
import { LinkGroupService } from './link-group.service';
import { LinkGroupController } from './link-group.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Link, LinkGroup])],
  controllers: [LinkController, LinkGroupController],
  providers: [LinkService, LinkGroupService]
})
export class LinkModule {}
