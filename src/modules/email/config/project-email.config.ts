/**
 * 项目邮件配置接口
 */
export interface ProjectEmailConfig {
  /** 项目名称 */
  projectName: string;
  /** 项目负责人邮箱 */
  responsibleEmail: string;
  /** 项目负责人姓名 */
  responsibleName?: string;
  /** 是否启用邮件通知 */
  emailEnabled?: boolean;
}

/**
 * 项目邮件配置映射
 * key: workspace_id
 * value: 项目邮件配置
 */
export const PROJECT_EMAIL_CONFIG: Record<string, ProjectEmailConfig> = {
  // 示例配置，请根据实际项目修改
  '64029412': {
    projectName: '工时评审系统',
    responsibleEmail: 'liyao@chinahuanong.com.cn',
    responsibleName: '项目经理',
    emailEnabled: true,
  },
  '87654321': {
    projectName: 'TAPD飞书自动化',
    responsibleEmail: 'tech.lead@company.com',
    responsibleName: '技术负责人',
    emailEnabled: true,
  },
  // 添加更多项目配置...
};

/**
 * 根据workspace_id获取项目邮件配置
 */
export function getProjectEmailConfig(workspaceId: string): ProjectEmailConfig | null {
  return PROJECT_EMAIL_CONFIG[workspaceId] || null;
}

/**
 * 获取所有已配置的项目列表
 */
export function getAllProjectConfigs(): Array<{ workspaceId: string; config: ProjectEmailConfig }> {
  return Object.entries(PROJECT_EMAIL_CONFIG).map(([workspaceId, config]) => ({
    workspaceId,
    config,
  }));
}
