import { Injectable, Logger } from '@nestjs/common';
import { TapdService } from '../tapd/tapd.service';
import { FeishuService } from '../feishu/feishu.service';
import { TapdWebhookDto } from './dto/tapd-webhook.dto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly tapdService: TapdService,
    private readonly feishuService: FeishuService,
  ) {}

  /**
   * 处理 TAPD Webhook
   */
  async processTapdWebhook(
    payload: TapdWebhookDto,
    _headers: Record<string, string>,
  ): Promise<any> {
    this.logger.log('开始处理TAPD Webhook', {
      eventKey: payload.event.event_key,
      objectType: payload.event.object_type,
      workspaceId: payload.workspace_id,
    });

    // 验证 Webhook 签名（如果配置了密钥）
    // await this.validateWebhookSignature(payload, headers);

    // 根据事件键处理
    switch (payload.event.event_key) {
      case 'story::attachment':
        // 检查是否是附件添加事件
        if (payload.event.new?.sub_event === 'attachment_add') {
          return await this.handleAttachmentEvent(payload);
        }
        break;

      default:
        this.logger.warn('未处理的事件类型', {
          eventKey: payload.event.event_key,
          subEvent: payload.event.new?.sub_event
        });
        return {
          message: '事件类型未处理',
          eventKey: payload.event.event_key,
          subEvent: payload.event.new?.sub_event
        };
    }

    return { message: '事件未处理' };
  }

  /**
   * 处理附件事件
   */
  private async handleAttachmentEvent(payload: TapdWebhookDto): Promise<any> {
    try {
      // 从新的数据结构中获取附件ID
      const attachmentId = payload.event.new?.attachment_id;
      if (!attachmentId) {
        throw new Error('无法从webhook数据中获取附件ID');
      }

      // 1. 获取附件信息
      const attachment = await this.tapdService.getAttachment(attachmentId);
      attachment.url = payload.event.new?.attachment_url;
      console.log(attachment,'attachment')
      if (!attachment) {
        throw new Error('无法获取附件信息');
      }

      this.logger.log('获取到附件信息', {
        attachmentId: attachment.id,
        name: attachment.name,
        entryType: attachment.entry_type,
        entryId: attachment.entry_id,
        url: attachment.url,
      });

      // 2. 验证附件名称格式
      const parsedInfo = this.parseAttachmentName(attachment.name);
      if (!parsedInfo.isValid) {
        this.logger.warn('附件名称格式不符合要求', {
          name: attachment.name,
          error: parsedInfo.error,
        });
        return { message: '附件名称格式不符合要求', error: parsedInfo.error };
      }

      // 3. 获取需求信息
      let storyInfo = null;
      if (attachment.entry_type === 'story') {
        storyInfo = await this.tapdService.getStory(attachment.entry_id);
      }
      // 获取项目信息
      const projectInfo = await this.tapdService.getProject(attachment.workspace_id);

      // 4. 构建飞书表格记录数据
      const recordData = this.buildFeishuRecord(attachment, storyInfo, parsedInfo,projectInfo);

      // 5. 添加到飞书多维表格
      const result = await this.feishuService.createRecord(recordData);

      this.logger.log('成功添加记录到飞书表格', { recordId: result.record_id });

      return {
        message: '成功处理附件事件',
        attachmentId: attachment.id,
        attachmentName: attachment.name,
        feishuRecordId: result.record_id,
        parsedInfo,
      };

    } catch (error) {
      this.logger.error('处理附件事件失败', {
        error: error.message,
        stack: error.stack,
        payload,
      });
      throw error;
    }
  }

  /**
   * 解析附件名称
   */
  private parseAttachmentName(name: string): {
    type: string;
    storyName: string;
    originalName: string;
    isValid: boolean;
    error?: string;
  } {
    // 匹配格式：前端-需求名.xlsx 或 后端-需求名.xlsx
    const regex = /^(前端|后端)-(.+)\.(xlsx?|xls)$/i;
    const match = name.match(regex);

    if (!match) {
      return {
        type: '',
        storyName: '',
        originalName: name,
        isValid: false,
        error: '附件名称格式应为：前端-需求名.xlsx 或 后端-需求名.xlsx',
      };
    }

    return {
      type: match[1],
      storyName: match[2].trim(),
      originalName: name,
      isValid: true,
    };
  }

  /**
   * 构建飞书表格记录数据
   */
  private buildFeishuRecord(attachment: any, storyInfo: any, parsedInfo: any,projectInfo:any): any {
    const now = new Date().toISOString();

    // 生成 TAPD 链接
    const tapdLink = attachment.entry_type === 'story'
      ? this.tapdService.getStoryLink(attachment.entry_id)
      : '';

    return {
      "需求tapd链接":{
        "link": tapdLink,
        "text": storyInfo?.name || '未知需求'
      },
      "项目": projectInfo?.name || '未知项目',
      "开发人员": attachment.author,
      "工时评审状态": "",
      "项目id": projectInfo?.id || '未知项目',
      "附件链接":attachment.url,
      "是否有异":""
    };
  }

  /**
   * 验证 Webhook 签名（可选实现）
   */
  private async validateWebhookSignature(
    _payload: TapdWebhookDto,
    _headers: Record<string, string>,
  ): Promise<void> {
    // TODO: 实现签名验证逻辑
    // const signature = headers['x-tapd-signature'];
    // if (signature) {
    //   // 验证签名
    // }
  }
}
