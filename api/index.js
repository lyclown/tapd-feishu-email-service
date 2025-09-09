const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');

let cachedApp;

module.exports = async (req, res) => {
  try {
    if (!cachedApp) {
      // 动态导入编译后的模块
      const { AppModule } = require('../dist/app.module');
      
      cachedApp = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log'],
      });
      
      // 全局验证管道
      cachedApp.useGlobalPipes(
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
      cachedApp.enableCors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
        credentials: true,
      });

      await cachedApp.init();
    }

    const expressApp = cachedApp.getHttpAdapter().getInstance();
    return expressApp(req, res);
    
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
