import { IsString, IsNumber, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TapdWebhookEventDto {
  @ApiProperty({ description: '工作空间ID', example: '64029412' })
  @IsString()
  workspace_id: string;

  @ApiProperty({ description: '用户', example: '李耀' })
  @IsString()
  user: string;

  @ApiProperty({ description: '对象类型', example: 'story' })
  @IsString()
  object_type: string;

  @ApiProperty({ description: '对象ID', example: '1164029412001164244' })
  @IsString()
  id: string;

  @ApiProperty({ description: '时间戳', example: 1757420574 })
  @IsNumber()
  timestamp: number;

  @ApiProperty({ description: '微秒时间戳', example: 1757420574636 })
  @IsNumber()
  timestamp_micro: number;

  @ApiProperty({ description: '新数据', required: false })
  @IsOptional()
  @IsObject()
  new?: any;

  @ApiProperty({ description: '旧数据', required: false })
  @IsOptional()
  @IsObject()
  old?: any;

  @ApiProperty({ description: '对象信息', required: false })
  @IsOptional()
  @IsObject()
  object_info?: any;

  @ApiProperty({ description: '事件键', example: 'story::attachment' })
  @IsString()
  event_key: string;

  @ApiProperty({ description: '来源', example: 'web' })
  @IsString()
  from: string;

  @ApiProperty({ description: '事件ID', example: '34a40806427a5354e35bb51959708568_tdjob_398-1757420540_39_2aeb6f9f0949' })
  @IsString()
  event_id: string;
}

export class TapdWebhookDto {
  @ApiProperty({ description: '自动任务ID', example: '1164029412001000237' })
  @IsString()
  auto_task_id: string;

  @ApiProperty({ description: '自动任务分支ID', example: '1164029412001001938' })
  @IsString()
  auto_task_branch_id: string;

  @ApiProperty({ description: '工作空间ID', example: '64029412' })
  @IsString()
  workspace_id: string;

  @ApiProperty({ description: '搜索条件', required: false })
  @IsOptional()
  search?: any;

  @ApiProperty({ description: '事件数据', type: TapdWebhookEventDto })
  @IsObject()
  event: TapdWebhookEventDto;
}
