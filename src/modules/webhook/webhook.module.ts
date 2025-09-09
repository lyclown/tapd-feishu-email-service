import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { TapdModule } from '../tapd/tapd.module';
import { FeishuModule } from '../feishu/feishu.module';

@Module({
  imports: [TapdModule, FeishuModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
