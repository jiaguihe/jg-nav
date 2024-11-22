import { Module } from '@nestjs/common';
import { AppController } from 'src/app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './module/user/user.module';
import 'dotenv/config';
import { database } from './database.config';
import { LinksModule } from './module/links/links.module';

@Module({
  imports: [UserModule, TypeOrmModule.forRoot(database), LinksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
