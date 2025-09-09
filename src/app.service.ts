import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getAppInfo() {
    return {
      name: 'TAPD-飞书自动化服务',
      version: '1.0.0',
      description: '自动将TAPD附件信息同步到飞书多维表格',
      status: 'running',
      endpoints: {
        health: '/health',
        webhook: '/webhook/tapd',
        docs: '/api',
      },
      timestamp: new Date().toISOString(),
    };
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
    };
  }
}
