import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TapdService } from './tapd.service';

@Module({
  imports: [HttpModule],
  providers: [TapdService],
  exports: [TapdService],
})
export class TapdModule {}
