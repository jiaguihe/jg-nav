import 'reflect-metadata';
import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // 可选 HTTPS：配置 SSL_KEY/SSL_CERT 时启用（沿用旧版 Nest 直挂证书的部署方式），
  // 未配置则以 HTTP 启动（nginx 反代场景）
  const sslKey = process.env.SSL_KEY;
  const sslCert = process.env.SSL_CERT;
  const httpsOptions =
    sslKey && sslCert
      ? { key: fs.readFileSync(sslKey), cert: fs.readFileSync(sslCert) }
      : undefined;
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    httpsOptions ? { httpsOptions } : {}
  );

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
