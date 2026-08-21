import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // httpOnly Cookie 会话的基础设施
  app.use(cookieParser());

  // 统一入参校验：DTO 配合 class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  const isProd = process.env.NODE_ENV === 'production';
  const frontendOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  app.enableCors({
    origin: frontendOrigin.split(',').map((o) => o.trim()),
    credentials: true
  });

  app.setGlobalPrefix('api');

  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('JG-Nav API')
      .setDescription('导航站接口文档')
      .setVersion('2.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`服务已启动: http://localhost:${port}/api`);
}
bootstrap();
