const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const fs = require('fs');
const path = require('path');

let app;

async function createApp() {
  if (!app) {
    try {
      // 调试信息：检查文件系统
      console.log('Current working directory:', process.cwd());
      console.log('Files in current directory:', fs.readdirSync('.'));

      // 检查可能的模块路径
      const possiblePaths = [
        './dist/app.module.js',
        './dist/app.module.js',
        './dist/app.module',
        './dist/app.module'
      ];

      let AppModule;
      let foundPath = null;

      for (const modulePath of possiblePaths) {
        try {
          if (fs.existsSync(modulePath)) {
            console.log('Found module at:', modulePath);
            const moduleExports = require(modulePath);
            AppModule = moduleExports.AppModule;
            foundPath = modulePath;
            break;
          }
        } catch (error) {
          console.log('Failed to load from:', modulePath, error.message);
        }
      }

      if (!AppModule) {
        // 如果找不到编译后的模块，尝试直接使用 TypeScript 源码
        console.log('Compiled module not found, trying to use ts-node...');
        require('ts-node/register');
        const { AppModule: TSAppModule } = require('./src/app.module.ts');
        AppModule = TSAppModule;
      }

      if (!AppModule) {
        throw new Error('Could not load AppModule from any path');
      }

      console.log('Successfully loaded AppModule from:', foundPath || 'TypeScript source');

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
