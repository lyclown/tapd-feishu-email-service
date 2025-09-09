import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FeishuService } from './feishu.service';

@Module({
  imports: [HttpModule],
  providers: [FeishuService],
  exports: [FeishuService],
})
export class FeishuModule {}
