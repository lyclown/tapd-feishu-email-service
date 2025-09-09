const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');

let app;

async function createApp() {
  if (!app) {
    const { AppModule } = require('../dist/app.module');
    app = await NestFactory.create(AppModule);
    
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
  }
  return app;
}

module.exports = async (req, res) => {
  const nestApp = await createApp();
  const expressApp = nestApp.getHttpAdapter().getInstance();
  return expressApp(req, res);
};
