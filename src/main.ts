import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule);

    // 全局验证管道
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // CORS 配置
    app.enableCors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      credentials: true,
    });

    // Swagger 文档配置
    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('TAPD-飞书自动化系统')
        .setDescription('自动将TAPD附件信息同步到飞书多维表格的API文档')
        .setVersion('1.0')
        .addTag('webhook', 'Webhook相关接口')
        .addTag('health', '健康检查接口')
        .build();
      
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api', app, document);
    }

    const port = process.env.PORT || 3000;
    await app.listen(port);

    logger.log(`🚀 应用启动成功，端口: ${port}`);
    logger.log(`📚 API文档地址: http://localhost:${port}/api`);
    logger.log(`🏥 健康检查: http://localhost:${port}/health`);
    
  } catch (error) {
    logger.error('应用启动失败:', error);
    process.exit(1);
  }
}

bootstrap();
