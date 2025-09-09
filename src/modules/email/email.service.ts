import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import * as nodemailer from 'nodemailer';
import { firstValueFrom } from 'rxjs';
import { getProjectEmailConfig } from './config/project-email.config';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,

  ) {
    this.initializeTransporter();
  }

  /**
   * 初始化邮件传输器
   */
  private initializeTransporter() {
    const smtpConfig = {
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    };

    this.transporter = nodemailer.createTransport(smtpConfig);

    this.logger.log('邮件传输器初始化完成', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      user: smtpConfig.auth.user,
    });
  }

  /**
   * 发送需求确认邮件
   */
  async sendRequirementConfirmationEmail(sendEmailDto: SendEmailDto): Promise<any> {
    const { workspace_id, story_name, attachment_url, attachment_filename, email_content } = sendEmailDto;

    // 1. 获取项目配置
    const projectConfig = getProjectEmailConfig(workspace_id);
    if (!projectConfig) {
      throw new NotFoundException(`未找到workspace_id为 ${workspace_id} 的项目配置`);
    }

    if (!projectConfig.emailEnabled) {
      throw new BadRequestException(`项目 ${projectConfig.projectName} 未启用邮件通知`);
    }

    this.logger.log('开始发送需求确认邮件', {
      workspaceId: workspace_id,
      projectName: projectConfig.projectName,
      recipientEmail: projectConfig.responsibleEmail,
      storyName: story_name,
    });

    try {
      // 2. 下载附件
      const attachmentBuffer = await this.downloadAttachment(attachment_url);

      // 3. 构建邮件内容
      const finalFilename = attachment_filename || this.extractFilenameFromUrl(attachment_url);
      const finalEmailContent = email_content || '需求已确认';

      const mailOptions = {
        from: this.configService.get<string>('SMTP_FROM_EMAIL'),
        to: projectConfig.responsibleEmail,
        subject: story_name,
        text: finalEmailContent,
        html: this.buildEmailHtml(story_name, finalEmailContent, projectConfig),
        attachments: [
          {
            filename: finalFilename,
            content: attachmentBuffer,
          },
        ],
      };

      // 4. 发送邮件
      const result = await this.transporter.sendMail(mailOptions);

      this.logger.log('邮件发送成功', {
        messageId: result.messageId,
        recipient: projectConfig.responsibleEmail,
        subject: story_name,
      });

      return {
        success: true,
        messageId: result.messageId,
        recipient: projectConfig.responsibleEmail,
        subject: story_name,
        projectName: projectConfig.projectName,
      };

    } catch (error) {
      this.logger.error('邮件发送失败', {
        error: error.message,
        stack: error.stack,
        workspaceId: workspace_id,
        storyName: story_name,
      });
      throw error;
    }
  }

  /**
   * 下载附件
   */
  private async downloadAttachment(url: string): Promise<Buffer> {
    try {
      // 清理URL，移除可能的空格和特殊字符
      const cleanUrl = url.trim();
      this.logger.debug('开始下载附件', { originalUrl: url, cleanUrl });

      const response = await firstValueFrom(
        this.httpService.get(cleanUrl, {
          responseType: 'arraybuffer',
          timeout: 30000,
        })
      );

      this.logger.debug('附件下载完成', {
        url,
        size: response.data.length,
        contentType: response.headers['content-type'],
      });

      return Buffer.from(response.data);
    } catch (error) {
      this.logger.error('附件下载失败', {
        url,
        error: error.message,
      });
      throw new BadRequestException(`附件下载失败: ${error.message}`);
    }
  }

  /**
   * 构建邮件HTML内容
   */
  private buildEmailHtml(requirementName: string, content: string, projectConfig: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>需求确认通知</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .content { padding: 20px; }
          .footer { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>需求确认通知</h2>
          </div>
          <div class="content">
            <p>尊敬的 ${projectConfig.responsibleName || '项目负责人'}，</p>
            <p><strong>项目：</strong>${projectConfig.projectName}</p>
            <p><strong>需求名称：</strong>${requirementName}</p>
            <p><strong>通知内容：</strong>${content}</p>
            <p>请查看附件中的详细信息。</p>
          </div>
          <div class="footer">
            <p>此邮件由系统自动发送，请勿回复。</p>
            <p>发送时间：${new Date().toLocaleString('zh-CN')}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 从URL中提取文件名
   */
  private extractFilenameFromUrl(url: string): string {
    try {
      // 先清理URL，移除可能的空格和特殊字符
      const cleanUrl = url.trim();

      // 尝试直接从路径中提取文件名，避免使用 new URL()
      const parts = cleanUrl.split('/');
      const lastPart = parts[parts.length - 1];

      // 如果最后一部分包含文件扩展名，使用它
      if (lastPart && lastPart.includes('.')) {
        // 移除查询参数
        const filename = lastPart.split('?')[0];
        return filename || 'attachment.file';
      }

      // 如果没有找到合适的文件名，返回默认值
      return 'attachment.file';
    } catch (error) {
      this.logger.warn('无法从URL提取文件名', { url, error: error.message });
      return 'attachment.file';
    }
  }

  /**
   * 测试邮件配置
   */
  async testEmailConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('邮件服务连接测试成功');
      return true;
    } catch (error) {
      this.logger.error('邮件服务连接测试失败', error.message);
      return false;
    }
  }
}
