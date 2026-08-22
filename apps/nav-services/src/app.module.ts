import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { LinkModule } from './modules/link/link.module';
import { TakeawayModule } from './modules/takeaway/takeaway.module';
import { TodoModule } from './modules/todo/todo.module';
import { NoteModule } from './modules/note/note.module';
import { MemorialModule } from './modules/memorial/memorial.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // forRootAsync：.env 由 ConfigModule 加载，注入阶段读取，避免模块求值顺序问题
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '3306'), 10),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_DATABASE', 'jgnav'),
        autoLoadEntities: true,
        // 首次部署空库时可设 DB_SYNCHRONIZE=true 自动建表，建完建议改回 false（生产防误改表）
        synchronize: config.get('DB_SYNCHRONIZE') === 'true'
      })
    }),
    UserModule,
    LinkModule,
    TakeawayModule,
    TodoModule,
    NoteModule,
    MemorialModule
  ]
})
export class AppModule {}
