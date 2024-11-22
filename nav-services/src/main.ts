import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import 'dotenv/config';
import 'reflect-metadata';

async function bootstrap() {
  const PORT = process.env.PORT || 3000;
  const logger: Logger = new Logger('main.ts');
  const PREFIX = process.env.PREFIX || '';
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('JG-nav')
    .setDescription('The nav API description')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000, () => {
    logger.log(
      `服务已经启动,接口请访问: http://www.localhost:${PORT}/${PREFIX}api`,
    );
  });
}
bootstrap();
