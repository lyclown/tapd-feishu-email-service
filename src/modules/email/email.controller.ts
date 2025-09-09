import { Controller, Post, Body, Get, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';
import { getAllProjectConfigs } from './config/project-email.config';

@ApiTags('email')
@Controller('email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  /**
   * 发送需求确认邮件
   * 供飞书多维文档按钮调用
   */
  @Post('send-requirement-confirmation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '发送需求确认邮件',
    description: '根据workspace_id发送需求确认邮件给项目负责人，邮件包含附件',
  })
  @ApiBody({ type: SendEmailDto })
  @ApiResponse({
    status: 200,
    description: '邮件发送成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        messageId: { type: 'string', example: '<message-id@example.com>' },
        recipient: { type: 'string', example: 'manager@company.com' },
        subject: { type: 'string', example: '用户登录功能优化' },
        projectName: { type: 'string', example: '工时评审系统' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '未找到项目配置',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: '未找到workspace_id为 12345678 的项目配置' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误或项目未启用邮件通知',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: '项目 工时评审系统 未启用邮件通知' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async sendRequirementConfirmationEmail(@Body() sendEmailDto: SendEmailDto) {
    this.logger.log('收到发送邮件请求', {
      workspaceId: sendEmailDto.workspace_id,
      storyName: sendEmailDto.story_name,
    });

    try {
      const result = await this.emailService.sendRequirementConfirmationEmail(sendEmailDto);
      
      this.logger.log('邮件发送请求处理完成', {
        success: result.success,
        messageId: result.messageId,
        recipient: result.recipient,
      });

      return result;
    } catch (error) {
      this.logger.error('邮件发送请求处理失败', {
        error: error.message,
        workspaceId: sendEmailDto.workspace_id,
        storyName: sendEmailDto.story_name,
      });
      throw error;
    }
  }

  /**
   * 获取所有项目配置
   */
  @Get('project-configs')
  @ApiOperation({
    summary: '获取所有项目配置',
    description: '获取所有已配置的项目列表及其邮件配置信息',
  })
  @ApiResponse({
    status: 200,
    description: '项目配置列表',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          workspaceId: { type: 'string', example: '12345678' },
          config: {
            type: 'object',
            properties: {
              projectName: { type: 'string', example: '工时评审系统' },
              responsibleEmail: { type: 'string', example: 'manager@company.com' },
              responsibleName: { type: 'string', example: '项目经理' },
              emailEnabled: { type: 'boolean', example: true },
            },
          },
        },
      },
    },
  })
  getProjectConfigs() {
    this.logger.log('获取项目配置列表');
    return getAllProjectConfigs();
  }

  /**
   * 测试邮件服务连接
   */
  @Get('test-connection')
  @ApiOperation({
    summary: '测试邮件服务连接',
    description: '测试SMTP邮件服务器连接是否正常',
  })
  @ApiResponse({
    status: 200,
    description: '连接测试结果',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '邮件服务连接正常' },
      },
    },
  })
  async testEmailConnection() {
    this.logger.log('测试邮件服务连接');
    
    const isConnected = await this.emailService.testEmailConnection();
    
    return {
      success: isConnected,
      message: isConnected ? '邮件服务连接正常' : '邮件服务连接失败',
    };
  }
}
