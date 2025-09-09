# 云服务部署指南

## 免费方案推荐

### 1. Vercel部署（推荐，完全免费）

#### 优势
- ✅ 完全免费
- ✅ 自动HTTPS
- ✅ 全球CDN
- ✅ 自动部署
- ✅ 环境变量管理

#### 部署步骤

1. **准备代码**
   ```bash
   # 确保项目可以构建
   npm run build
   
   # 提交代码到Git
   git add .
   git commit -m "准备Vercel部署"
   git push origin main
   ```

2. **部署到Vercel**
   - 访问 https://vercel.com/
   - 使用GitHub账号登录
   - 点击 "New Project"
   - 选择您的GitHub仓库
   - 配置环境变量（见下方）
   - 点击 "Deploy"

3. **配置环境变量**
   在Vercel项目设置中添加以下环境变量：
   ```
   NODE_ENV=production
   TAPD_API_KEY=your_tapd_api_key
   TAPD_WORKSPACE_ID=64029412
   FEISHU_APP_ID=your_feishu_app_id
   FEISHU_APP_SECRET=your_feishu_app_secret
   FEISHU_BASE_TOKEN=your_feishu_base_token
   FEISHU_TABLE_ID=your_feishu_table_id
   WEBHOOK_SECRET=your_webhook_secret
   SMTP_HOST=smtp.exmail.qq.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=liyao@chinahuanong.com.cn
   SMTP_PASS=Mn6XWtQDa3TXfgU8
   SMTP_FROM_EMAIL=liyao@chinahuanong.com.cn
   ```

4. **获取部署URL**
   部署完成后，您会得到一个类似的URL：
   `https://your-project-name.vercel.app`

### 2. Railway部署（$5免费额度）

#### 部署步骤
1. 访问 https://railway.app/
2. 连接GitHub仓库
3. 配置环境变量
4. 自动部署

### 3. Render部署（免费层）

#### 部署步骤
1. 访问 https://render.com/
2. 创建新的Web Service
3. 连接GitHub仓库
4. 配置构建命令：`npm run build`
5. 配置启动命令：`npm run start:prod`

## 低成本方案（月费10-30元）

### 1. 腾讯云轻量应用服务器

#### 价格：24元/月
#### 配置：1核2GB，3Mbps带宽

```bash
# 连接服务器
ssh ubuntu@your-server-ip

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 克隆项目
git clone https://github.com/your-username/your-repo.git
cd your-repo

# 安装依赖并构建
npm install
npm run build

# 安装PM2
sudo npm install -g pm2

# 启动服务
pm2 start dist/main.js --name email-service

# 设置开机自启
pm2 startup
pm2 save
```

### 2. 华为云ECS（新用户1元/月）

类似腾讯云的部署流程。

## Docker部署方案

适用于任何支持Docker的云服务：

```bash
# 构建镜像
docker build -t email-service .

# 运行容器
docker run -d \
  --name email-service \
  -p 3000:3000 \
  --env-file .env \
  email-service

# 或使用docker-compose
docker-compose up -d
```

## 推荐选择

### 开发/测试环境
- **Vercel**：完全免费，适合API服务

### 生产环境（小规模）
- **腾讯云轻量**：24元/月，稳定可靠
- **Railway**：按使用量计费，适合小流量

### 生产环境（大规模）
- **阿里云ECS**：更多配置选项
- **AWS/Azure**：全球化部署

## 部署后测试

部署完成后，测试以下接口：

1. **健康检查**
   ```
   GET https://your-domain.com/
   ```

2. **项目配置**
   ```
   GET https://your-domain.com/email/project-configs
   ```

3. **邮件连接测试**
   ```
   GET https://your-domain.com/email/test-connection
   ```

4. **发送邮件**
   ```
   POST https://your-domain.com/email/send-requirement-confirmation
   Content-Type: application/json
   
   {
     "workspace_id": "64029412",
     "story_name": "测试需求",
     "attachment_url": "https://httpbin.org/json",
     "attachment_filename": "test.json"
   }
   ```

## 域名配置（可选）

如果您有自己的域名：

1. **Vercel**：在项目设置中添加自定义域名
2. **其他服务**：配置DNS A记录指向服务器IP

## SSL证书

- **Vercel/Railway/Render**：自动提供HTTPS
- **自建服务器**：使用Let's Encrypt免费证书

```bash
# 安装certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com
```
