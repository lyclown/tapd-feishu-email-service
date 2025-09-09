# TAPD-飞书工时评审自动化系统

## 项目简介

这是一个自动化系统，用于将 TAPD 中的工时评审附件信息自动同步到飞书多维表格中。当团队成员在 TAPD 需求评论中上传符合命名规范的 Excel 附件时，系统会自动解析附件信息并在飞书多维表格中创建相应的记录。

## 功能特性

- 🔄 **自动同步**: 监听 TAPD 附件上传事件，自动同步到飞书
- 📋 **智能解析**: 自动解析附件名称格式（如"前端-需求名"）
- 🛡️ **安全可靠**: 完善的错误处理和日志记录
- 🚀 **高性能**: 基于 Node.js + TypeScript 构建
- 📊 **数据完整**: 保留完整的需求信息和上传者信息

## 系统架构

```
TAPD 附件上传 → 触发自动化助手 → Webhook → 本系统 → 飞书多维表格
```

## 技术栈

- **后端**: Node.js + TypeScript + Express
- **HTTP 客户端**: Axios
- **日志**: Winston
- **配置管理**: dotenv
- **数据验证**: Joi
- **安全**: Helmet + CORS

## 快速开始

### 1. 环境准备

确保您的系统已安装：
- Node.js (>= 16.0.0)
- npm 或 yarn

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并填入相应配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入以下信息：

```env
# 服务配置
PORT=3000
NODE_ENV=development

# TAPD 配置
TAPD_API_USER=your_tapd_api_user
TAPD_API_PASSWORD=your_tapd_api_password
TAPD_WORKSPACE_ID=your_workspace_id

# 飞书配置
FEISHU_APP_ID=your_feishu_app_id
FEISHU_APP_SECRET=your_feishu_app_secret
FEISHU_BASE_TOKEN=your_base_token
FEISHU_TABLE_ID=your_table_id

# Webhook 安全配置
WEBHOOK_SECRET=your_webhook_secret
```

### 4. 启动开发服务器

```bash
npm run dev
```

### 5. 构建生产版本

```bash
npm run build
npm start
```

## API 端点

- `GET /` - 服务状态信息
- `GET /health` - 健康检查
- `POST /webhook/tapd` - TAPD Webhook 接收端点

## 配置说明

### TAPD 配置

1. 获取 TAPD API 权限（需要企业版）
2. 在项目设置中配置自动化助手
3. 设置触发条件为"新增附件"
4. 设置执行动作为调用 Webhook

### 飞书配置

1. 在飞书开放平台创建应用
2. 获取 App ID 和 App Secret
3. 申请多维表格相关权限
4. 获取目标表格的 Base Token 和 Table ID

## 附件命名规范

系统会解析以下格式的附件名称：
- `前端-需求名称.xlsx`
- `后端-需求名称.xlsx`

## 项目结构

```
src/
├── controllers/     # 控制器
├── services/        # 业务服务
├── types/          # TypeScript 类型定义
├── utils/          # 工具函数
├── middleware/     # 中间件
└── index.ts        # 应用入口
```

## 开发指南

### 代码规范

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码

### 测试

```bash
npm test
```

### 日志

日志文件位于 `logs/` 目录：
- `app.log` - 应用日志
- `error.log` - 错误日志
- `exceptions.log` - 异常日志

## 部署

### Docker 部署

```bash
# 构建镜像
docker build -t tapd-feishu-automation .

# 运行容器
docker run -d -p 3000:3000 --env-file .env tapd-feishu-automation
```

### PM2 部署

```bash
npm install -g pm2
npm run build
pm2 start dist/index.js --name tapd-feishu-automation
```

## 故障排除

### 常见问题

1. **环境变量未配置**: 检查 `.env` 文件是否正确配置
2. **API 权限不足**: 确认 TAPD 和飞书的 API 权限
3. **网络连接问题**: 检查服务器网络和防火墙设置

### 日志查看

```bash
# 查看实时日志
tail -f logs/app.log

# 查看错误日志
tail -f logs/error.log
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue 或联系开发团队。
