import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';

export interface TapdAttachment {
  id: string;
  name: string;
  size: number;
  url: string;
  created: string;
  author: string;
  entry_type: string;
  entry_id: string;
  workspace_id: string;
}

export interface TapdStory {
  id: string;
  name: string;
  description: string;
  status: string;
  creator: string;
  created: string;
  modified: string;
  workspace_id: string;
}

export interface TapdProject {
  id: string;
  name: string;
  description: string;
  status: string;
  creator: string;
  created: string;
  modified: string;
  workspace_id: string;
}

@Injectable()
export class TapdService {
  private readonly logger = new Logger(TapdService.name);
  private readonly workspaceId: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.workspaceId = configService.get<string>('TAPD_WORKSPACE_ID');
    this.apiKey = configService.get<string>('TAPD_API_KEY');
  }

  /**
   * 发送TAPD API请求
   */
  private async tapdRequest<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const requestConfig: AxiosRequestConfig = {
      ...config,
      baseURL: 'https://api.tapd.cn',
      headers: {
        'Authorization': `Basic ${this.apiKey}`,
        'User-Agent': 'TAPD-Feishu-Automation/1.0.0',
        'Content-Type': 'application/json',
        ...config?.headers,
      },
      timeout: 30000,
    };

    this.logger.debug('TAPD API 请求', {
      method: config?.method || 'GET',
      url,
      params: config?.params,
      baseURL: requestConfig.baseURL,
    });

    try {
      const response = await firstValueFrom(this.httpService.get<T>(url, requestConfig));

      this.logger.debug('TAPD API 响应', {
        status: response.status,
        statusText: response.statusText,
        url,
        dataSize: JSON.stringify(response.data).length,
      });

      // TAPD API 特定的响应处理
      if (response.data && (response.data as any).status !== 1) {
        throw new Error(`TAPD API 错误: ${(response.data as any).info || '未知错误'}`);
      }

      return response.data;
    } catch (error) {
      this.logger.error('TAPD API 请求错误', {
        message: error.message,
        url,
        config: requestConfig,
      });
      throw error;
    }
  }

  /**
   * 获取附件信息
   */
  async getAttachment(attachmentId: string): Promise<TapdAttachment | null> {
    try {
      const response = await this.tapdRequest('/attachments', {
        params: {
          id: attachmentId,
          workspace_id: this.workspaceId,
        },
      });

      this.logger.debug('TAPD附件API响应数据', {
        attachmentId,
        response: JSON.stringify(response, null, 2)
      });

      if (response.status === 1 && response.data && response.data.length > 0) {
        const attachment = response.data[0]?.Attachment;
        console.log(response,'attachmentattachment')
        if (attachment) {
          return {
            id: attachment.id,
            name: attachment.filename,
            size: attachment.size || 0,
            url: attachment.url || '',
            created: attachment.created,
            author: attachment.owner,
            entry_type: attachment.type,
            entry_id: attachment.entry_id,
            workspace_id: attachment.workspace_id,
          };
        }
      }

      this.logger.warn('获取附件信息失败', {
        attachmentId,
        response
      });
      return null;
    } catch (error) {
      this.logger.error('获取附件信息异常', { attachmentId, error: error.message });
      throw error;
    }
  }

  /**
   * 构建完整的需求 ID
   * 根据您的示例：11${workspaceId}00${storyId}
   */
  private buildStoryId(storyId: string): string {
    return `11${this.workspaceId}00${storyId}`;
  }

  /**
   * 获取需求信息
   * @param storyId - 需求ID（可以是完整ID或短格式）
   */
  async getStory(storyId: string): Promise<TapdStory | null> {
    try {
      // 判断是否已经是完整的需求ID（通常以11开头且包含workspace_id）
      const isFullId = storyId.startsWith('11') && storyId.includes(this.workspaceId);
      const fullStoryId = isFullId ? storyId : this.buildStoryId(storyId);

      this.logger.debug('获取需求信息', {
        originalStoryId: storyId,
        fullStoryId,
        isFullId,
        workspaceId: this.workspaceId,
      });

      const response = await this.tapdRequest('/stories', {
        params: {
          workspace_id: this.workspaceId,
          id: fullStoryId,
        },
      });
      console.log(response,'responseresponse')
      if (response.status === 1 && response.data && response.data.length > 0) {
        const story = response.data[0]?.Story;
        console.log(story,'storystory')
        if (story) {
          return {
            id: story.id,
            name: story.name,
            description: story.description || '',
            status: story.status || '',
            creator: story.creator || '',
            created: story.created || '',
            modified: story.modified || '',
            workspace_id: story.workspace_id || '',
          };
        }
      }

      this.logger.warn('获取需求信息失败', {
        storyId,
        fullStoryId,
        response
      });
      return null;
    } catch (error) {
      this.logger.error('获取需求信息异常', { storyId, error: error.message });
      throw error;
    }
  }

  /**
   * 获取项目信息
   * @param workspaceId - 工作空间ID
   */
  async getProject(workspaceId: string): Promise<TapdProject | null> {
    try {
      this.logger.debug('获取项目信息', {
        workspaceId,
      });

      const response = await this.tapdRequest('/workspaces/get_workspace_info', {
        params: {
          workspace_id: workspaceId,
        },
      });

      this.logger.debug('TAPD项目API响应数据', {
        workspaceId,
        response: JSON.stringify(response, null, 2)
      });

      if (response.status === 1 && response.data?.Workspace) {
        const workspace = response.data.Workspace;
        if (workspace) {
          return {
            id: workspace.id,
            name: workspace.name,
            description: workspace.description || workspace.objective || '',
            status: workspace.status || '',
            creator: workspace.creator || '',
            created: workspace.created || '',
            modified: workspace.modified || '',
            workspace_id: workspace.id || workspaceId,
          };
        }
      }

      this.logger.warn('获取项目信息失败', {
        workspaceId,
        response
      });
      return null;
    } catch (error) {
      this.logger.error('获取项目信息异常', { workspaceId, error: error.message });
      throw error;
    }
  }

  /**
   * 根据需求 ID 生成 TAPD 链接
   */
  getStoryLink(storyId: string): string {
    // 请根据您的 TAPD 实际链接格式进行调整
    return `https://www.tapd.cn/tapd_fe/${this.workspaceId}/story/detail/${storyId}`;
  }

  /**
   * 测试 API 连接
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.tapdRequest('/stories', {
        params: {
          workspace_id: this.workspaceId,
          limit: 1,
        },
      });

      return response.status === 1;
    } catch (error) {
      this.logger.error('TAPD API 连接测试失败', error.message);
      return false;
    }
  }
}
