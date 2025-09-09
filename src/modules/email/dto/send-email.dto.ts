import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 发送邮件请求DTO
 */
export class SendEmailDto {
  /**
   * TAPD项目的workspace_id
   */
  @ApiProperty({
    description: 'TAPD项目的workspace_id',
    example: '12345678'
  })
  @IsString()
  @IsNotEmpty()
  workspace_id: string;

  /**
   * 需求名称（邮件主题）
   */
  @ApiProperty({
    description: '需求名称，将作为邮件主题',
    example: '用户登录功能优化'
  })
  @IsString()
  @IsNotEmpty()
  story_name: string;

  /**
   * 附件下载URL
   */
  @ApiProperty({
    description: '附件下载URL',
    example: 'https://tapd.cn/attachment/download/12345'
  })
  @IsUrl()
  @IsNotEmpty()
  attachment_url: string;

  /**
   * 附件文件名（可选，如果不提供将从URL中提取）
   */
  @ApiProperty({
    description: '附件文件名',
    example: '前端-用户登录功能优化.xlsx',
    required: false
  })
  @IsString()
  @IsOptional()
  attachment_filename?: string;

  /**
   * 邮件正文（可选，默认为"需求已确认"）
   */
  @ApiProperty({
    description: '邮件正文内容',
    example: '需求已确认',
    required: false
  })
  @IsString()
  @IsOptional()
  email_content?: string;
}
