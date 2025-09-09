# 邮件服务模块

这个模块提供邮件发送功能，主要用于发送需求确认邮件给项目负责人。

## 功能特性

- 📧 发送需求确认邮件
- 📎 支持附件下载和发送
- 🏗️ 基于项目配置的邮件路由
- 🔧 灵活的SMTP配置
- 📊 完整的日志记录

## 配置说明

### 1. 环境变量配置

在 `.env` 文件中添加以下邮件服务配置：

```env
# 邮件服务配置
SMTP_HOST=smtp.example.com          # SMTP服务器地址
SMTP_PORT=587                       # SMTP端口
SMTP_SECURE=false                   # 是否使用SSL/TLS
SMTP_USER=your_email@example.com    # SMTP用户名
SMTP_PASS=your_email_password       # SMTP密码
SMTP_FROM_EMAIL=noreply@example.com # 发件人邮箱
```

### 2. 项目邮件配置

编辑 `src/modules/email/config/project-email.config.ts` 文件，添加项目配置：

```typescript
export const PROJECT_EMAIL_CONFIG: Record<string, ProjectEmailConfig> = {
  '12345678': {
    projectName: '工时评审系统',
    responsibleEmail: 'project.manager@company.com',
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
```

## API 接口

### 1. 发送需求确认邮件

**POST** `/email/send-requirement-confirmation`

用于飞书多维文档按钮调用，发送需求确认邮件。

#### 请求参数

```json
{
  "workspace_id": "12345678",
  "requirement_name": "用户登录功能优化",
  "attachment_url": "https://tapd.cn/attachment/download/12345",
  "attachment_filename": "前端-用户登录功能优化.xlsx",
  "email_content": "需求已确认"
}
```

#### 响应示例

```json
{
  "success": true,
  "messageId": "<message-id@example.com>",
  "recipient": "manager@company.com",
  "subject": "用户登录功能优化",
  "projectName": "工时评审系统"
}
```

### 2. 获取项目配置

**GET** `/email/project-configs`

获取所有已配置的项目列表。

### 3. 测试邮件连接

**GET** `/email/test-connection`

测试SMTP邮件服务器连接是否正常。

## 使用示例

### 飞书多维文档按钮调用

在飞书多维文档中，可以通过按钮调用邮件发送接口：

```javascript
// 飞书多维文档按钮脚本示例
const response = await fetch('http://your-server.com/email/send-requirement-confirmation', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    workspace_id: '12345678',
    requirement_name: '用户登录功能优化',
    attachment_url: 'https://tapd.cn/attachment/download/12345',
    attachment_filename: '前端-用户登录功能优化.xlsx',
    email_content: '需求已确认'
  })
});

const result = await response.json();
console.log('邮件发送结果:', result);
```

### 程序内调用

```typescript
import { EmailService } from './email.service';

// 注入服务
constructor(private readonly emailService: EmailService) {}

// 发送邮件
async sendEmail() {
  const result = await this.emailService.sendRequirementConfirmationEmail({
    workspace_id: '12345678',
    requirement_name: '用户登录功能优化',
    attachment_url: 'https://tapd.cn/attachment/download/12345',
    attachment_filename: '前端-用户登录功能优化.xlsx',
    email_content: '需求已确认'
  });
  
  console.log('邮件发送结果:', result);
}
```

## 常见问题

### 1. 邮件发送失败

- 检查SMTP配置是否正确
- 确认SMTP服务器是否允许外部连接
- 验证用户名和密码是否正确
- 检查网络连接

### 2. 找不到项目配置

- 确认workspace_id是否在配置文件中存在
- 检查配置文件格式是否正确

### 3. 附件下载失败

- 确认attachment_url是否可访问
- 检查网络连接和权限设置

## 日志说明

邮件服务会记录详细的操作日志，包括：

- 邮件发送请求
- 附件下载过程
- 邮件发送结果
- 错误信息

日志级别可通过环境变量 `LOG_LEVEL` 配置。
