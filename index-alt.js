const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const path = require('path');

let app;

async function createApp() {
  if (!app) {
    try {
      // 使用绝对路径
      const modulePath = path.join(__dirname, 'dist', 'src', 'app.module');
      console.log('Attempting to require:', modulePath);
      
      const { AppModule } = require(modulePath);
      
      app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log'],
      });
      
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

      app.enableCors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
        credentials: true,
      });

      await app.init();
      console.log('NestJS app initialized successfully');
    } catch (error) {
      console.error('Error creating NestJS app:', error);
      throw error;
    }
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
