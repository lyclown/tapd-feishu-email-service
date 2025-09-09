import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  // 服务配置
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  // TAPD 配置
  TAPD_API_KEY: Joi.string().required(),
  TAPD_WORKSPACE_ID: Joi.string().required(),

  // 飞书配置
  FEISHU_APP_ID: Joi.string().required(),
  FEISHU_APP_SECRET: Joi.string().required(),
  FEISHU_BASE_TOKEN: Joi.string().required(),
  FEISHU_TABLE_ID: Joi.string().required(),

  // Webhook 配置
  WEBHOOK_SECRET: Joi.string().default('default-secret'),

  // 日志配置
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
  LOG_FILE: Joi.string().default('logs/app.log'),

  // CORS 配置
  ALLOWED_ORIGINS: Joi.string().optional(),

  // 邮件服务配置
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().default(587),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),
  SMTP_FROM_EMAIL: Joi.string().email().required(),
});
