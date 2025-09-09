import { Controller, Post, Body, Headers, Logger, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { TapdWebhookDto } from './dto/tapd-webhook.dto';

@ApiTags('webhook')
@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  @Post('tapd')
  @HttpCode(200)
  @ApiOperation({ summary: '接收TAPD Webhook' })
  @ApiResponse({ status: 200, description: 'Webhook处理成功' })
  @ApiResponse({ status: 400, description: '请求数据无效' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  @ApiBody({ type: TapdWebhookDto })
  async handleTapdWebhook(
    @Body() payload: TapdWebhookDto,
    @Headers() headers: Record<string, string>,
  ) {
    this.logger.log('收到TAPD Webhook请求', {
      eventKey: payload.event.event_key,
      objectType: payload.event.object_type,
      objectId: payload.event.id,
      workspaceId: payload.workspace_id,
      user: payload.event.user,
    });

    try {
      const result = await this.webhookService.processTapdWebhook(payload, headers);
      
      this.logger.log('Webhook处理完成', { result });
      
      return {
        success: true,
        message: 'Webhook处理成功',
        data: result,
      };
    } catch (error) {
      this.logger.error('Webhook处理失败', {
        error: error.message,
        stack: error.stack,
        payload,
      });

      return {
        success: false,
        message: 'Webhook处理失败',
        error: error.message,
      };
    }
  }
}
