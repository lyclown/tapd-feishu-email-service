import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';

export interface FeishuRecord {
  fields: Record<string, any>;
}

export interface FeishuCreateRecordResponse {
  code: number;
  msg: string;
  data: {
    record: {
      record_id: string;
      id: string;
      fields: Record<string, any>;
    };
  };
}

export interface FeishuAccessToken {
  tenant_access_token: string;
  expire: number;
  code: number;
  msg: string;
}

@Injectable()
export class FeishuService {
  private readonly logger = new Logger(FeishuService.name);
  private readonly appId: string;
  private readonly appSecret: string;
  private readonly baseToken: string;
  private readonly tableId: string;
  private accessToken: string | null = null;
  private tokenExpireTime: number = 0;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.appId = configService.get<string>('FEISHU_APP_ID');
    this.appSecret = configService.get<string>('FEISHU_APP_SECRET');
    this.baseToken = configService.get<string>('FEISHU_BASE_TOKEN');
    this.tableId = configService.get<string>('FEISHU_TABLE_ID');
  }

  /**
   * 获取飞书访问令牌
   */
  private async getAccessToken(): Promise<void> {
    try {
      this.logger.debug('开始获取飞书访问令牌', {
        appId: this.appId,
        appSecretLength: this.appSecret?.length || 0,
      });

      const response = await firstValueFrom(
        this.httpService.post<FeishuAccessToken>(
          'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
          {
            app_id: this.appId,
            app_secret: this.appSecret,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      );

      this.logger.debug('飞书访问令牌API响应', {
        status: response.status,
        data: response.data,
      });

      if (response.data.code === 0 && response.data.tenant_access_token) {
        this.accessToken = response.data.tenant_access_token;
        this.tokenExpireTime = Date.now() + (response.data.expire - 60) * 1000; // 提前60秒过期
        this.logger.debug('成功获取飞书访问令牌');
      } else {
        throw new Error(`获取访问令牌失败: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      this.logger.error('获取飞书访问令牌失败', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error('获取访问令牌失败');
    }
  }

  /**
   * 确保有有效的访问令牌
   */
  private async ensureValidAccessToken(): Promise<void> {
    if (!this.accessToken || Date.now() >= this.tokenExpireTime) {
      await this.getAccessToken();
    }
  }

  /**
   * 发送飞书API请求
   */
  private async feishuRequest<T = any>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    await this.ensureValidAccessToken();

    const requestConfig: AxiosRequestConfig = {
      baseURL: 'https://open.feishu.cn/open-apis',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    };

    this.logger.debug('飞书 API 请求', {
      method,
      url,
      baseURL: requestConfig.baseURL,
    });

    try {
      let response: any;
      switch (method) {
        case 'POST':
          response = await firstValueFrom(this.httpService.post<T>(url, data, requestConfig));
          break;
        case 'PUT':
          response = await firstValueFrom(this.httpService.put<T>(url, data, requestConfig));
          break;
        case 'DELETE':
          response = await firstValueFrom(this.httpService.delete<T>(url, requestConfig));
          break;
        default:
          response = await firstValueFrom(this.httpService.get<T>(url, requestConfig));
      }

      this.logger.debug('飞书 API 响应', {
        status: response.status,
        statusText: response.statusText,
        url,
        dataSize: JSON.stringify(response.data).length,
      });

      return response.data;
    } catch (error) {
      this.logger.error('飞书 API 请求错误', {
        message: error.message,
        url,
        method,
      });
      throw error;
    }
  }

  /**
   * 创建多维表格记录
   */
  async createRecord(recordData: Record<string, any>): Promise<any> {
    try {
      const response = await this.feishuRequest<FeishuCreateRecordResponse>(
        `/bitable/v1/apps/${this.baseToken}/tables/${this.tableId}/records`,
        'POST',
        {
          fields: recordData,
        }
      );

      this.logger.debug('飞书创建记录API响应', {
        response: JSON.stringify(response, null, 2),
      });

      if (response.code === 0 && response.data?.record) {
        const record = response.data.record;
        this.logger.log('成功创建飞书表格记录', { recordId: record.record_id });
        return record;
      }

      throw new Error(`创建记录失败: ${response.msg}`);
    } catch (error) {
      this.logger.error('创建飞书表格记录失败', {
        error: error.message,
        recordData,
      });
      throw error;
    }
  }

  /**
   * 测试飞书 API 连接
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.feishuRequest(`/bitable/v1/apps/${this.baseToken}/tables`);
      return response.code === 0;
    } catch (error) {
      this.logger.error('飞书 API 连接测试失败', error.message);
      return false;
    }
  }
}
