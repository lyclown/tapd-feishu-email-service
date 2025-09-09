const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');

let app;

async function createApp() {
  if (!app) {
    // 动态导入编译后的模块
    const { AppModule } = require('./dist/src/app.module');
    
    app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });
    
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

    await app.init();
  }
  return app;
}

module.exports = async (req, res) => {
  try {
    const nestApp = await createApp();
    const expressApp = nestApp.getHttpAdapter().getInstance();
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
