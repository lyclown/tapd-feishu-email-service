# 配置获取指南

本文档详细说明如何获取 TAPD-飞书自动化系统所需的各种配置参数。

## 🚀 快速开始

### 方法一：使用配置助手（推荐）
```bash
npm run setup
```

### 方法二：手动配置
按照下面的步骤逐一获取配置参数。

## 📋 配置参数详解

### 1. TAPD 配置

#### 1.1 获取 API 权限

**前提条件：**
- 需要 TAPD 企业版
- 需要项目管理员权限

**步骤：**
1. 登录 TAPD → 进入您的项目
2. 点击 **项目设置** → **开放集成** → **API账号管理**
3. 点击 **申请试用** 或 **申请正式版**
4. 填写申请信息，等待审核通过
5. 审核通过后，获得：
   - `TAPD_API_USER`: API 用户名
   - `TAPD_API_PASSWORD`: API 密码

#### 1.2 获取项目 ID

**方法一：从 URL 获取**
- 在 TAPD 项目页面，查看浏览器地址栏
- URL 格式：`https://www.tapd.cn/{WORKSPACE_ID}/prong/stories/view/xxx`
- `{WORKSPACE_ID}` 就是您需要的项目 ID

**方法二：从项目设置获取**
- 项目设置 → 项目信息 → 项目 ID

### 2. 飞书应用配置

#### 2.1 创建飞书应用

1. **访问飞书开放平台**：https://open.feishu.cn/
2. **登录** → **开发者后台**
3. **创建应用** → **企业自建应用**
4. **填写应用信息**：
   ```
   应用名称: TAPD工时评审自动化
   应用描述: 自动将TAPD附件信息同步到飞书多维表格
   应用图标: 上传一个合适的图标
   ```
5. **创建完成**，获得：
   - `FEISHU_APP_ID`: 应用 ID
   - `FEISHU_APP_SECRET`: 应用密钥

#### 2.2 配置应用权限

在应用管理页面：

1. **权限管理** → **申请权限**
2. **添加以下权限**：
   ```
   多维表格权限:
   - bitable:app (获取多维表格信息)
   - bitable:app:readonly (读取多维表格)  
   - bitable:app:readwrite (读写多维表格)
   ```
3. **提交审核**（企业管理员审核）

#### 2.3 发布应用

1. **应用发布** → **创建版本**
2. **填写版本信息** → **提交审核**
3. **审核通过后** → **全员可见**

### 3. 飞书多维表格配置

#### 3.1 创建多维表格

1. **打开飞书** → **多维表格**
2. **创建新的多维表格**
3. **设计表格结构**，建议包含以下字段：
   ```
   - 需求名称 (文本)
   - 类型 (单选: 前端/后端)
   - 评审人 (文本)
   - 上传时间 (日期时间)
   - TAPD链接 (URL)
   - 附件名称 (文本)
   - 项目ID (文本)
   - 需求ID (文本)
   - 处理时间 (日期时间)
   ```

#### 3.2 获取表格配置

1. **打开您的多维表格**
2. **查看浏览器地址栏**：
   ```
   https://xxx.feishu.cn/base/{BASE_TOKEN}?table={TABLE_ID}&view=xxx
   ```
3. **提取参数**：
   - `FEISHU_BASE_TOKEN`: base/ 后面的字符串
   - `FEISHU_TABLE_ID`: table= 后面的字符串

#### 3.3 设置表格权限

1. **表格设置** → **权限设置**
2. **添加应用权限**：
   - 找到您创建的应用
   - 设置为 **可编辑** 权限

### 4. Webhook 配置

#### 4.1 部署服务

确保您的服务已部署并可以从外网访问：

```bash
# 本地开发
npm run start:dev

# 生产部署
npm run build
npm run start:prod
```

#### 4.2 配置 TAPD 自动化助手

1. **TAPD 项目** → **设置** → **自动化助手**
2. **新建自动化规则**
3. **触发条件**：
   - 选择 **新增附件时**
   - 可以添加过滤条件（如附件名称包含特定关键词）
4. **执行动作**：
   - 选择 **发送 Webhook**
   - 填入您的服务地址：`https://your-domain.com/webhook/tapd`
5. **保存并启用规则**

## 🧪 配置验证

### 验证配置是否正确

```bash
npm run test:config
```

这个命令会：
- 检查所有必需的环境变量
- 测试 TAPD API 连接
- 测试飞书 API 连接
- 验证多维表格访问权限

### 常见问题排查

#### TAPD API 问题
- **401 错误**：检查用户名密码是否正确
- **403 错误**：检查是否有 API 权限
- **404 错误**：检查项目 ID 是否正确

#### 飞书 API 问题
- **权限不足**：检查应用权限是否申请并通过审核
- **表格不存在**：检查 Base Token 和 Table ID 是否正确
- **应用未发布**：确保应用已发布并对用户可见

## 📝 配置文件示例

完整的 `.env` 文件示例：

```env
# 服务配置
PORT=3000
NODE_ENV=production

# TAPD 配置
TAPD_API_USER=your_actual_api_user
TAPD_API_PASSWORD=your_actual_api_password
TAPD_WORKSPACE_ID=12345678

# 飞书配置
FEISHU_APP_ID=cli_xxxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxx
FEISHU_BASE_TOKEN=bascnxxxxxxxxxx
FEISHU_TABLE_ID=tblxxxxxxxxxx

# Webhook 安全配置
WEBHOOK_SECRET=your-secure-secret-key

# 日志配置
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

## 🔒 安全注意事项

1. **不要将 `.env` 文件提交到版本控制系统**
2. **定期更换 API 密钥和 Webhook 密钥**
3. **使用 HTTPS 部署生产服务**
4. **限制 API 权限范围，只申请必需的权限**
5. **监控 API 调用日志，及时发现异常**

## 📞 获取帮助

如果在配置过程中遇到问题：

1. **查看日志文件**：`logs/app.log`
2. **运行配置验证**：`npm run test:config`
3. **检查 API 文档**：
   - [TAPD API 文档](https://open.tapd.cn/document/api-doc/)
   - [飞书 API 文档](https://open.feishu.cn/document/)
4. **联系技术支持**
