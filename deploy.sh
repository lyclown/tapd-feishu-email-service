#!/bin/bash

# 阿里云ECS部署脚本
# 使用方法: chmod +x deploy.sh && ./deploy.sh

set -e

echo "🚀 开始部署邮件服务到阿里云ECS..."

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo "请使用root用户运行此脚本"
    exit 1
fi

# 更新系统
echo "📦 更新系统包..."
apt update && apt upgrade -y

# 安装Node.js
echo "📦 安装Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 安装PM2
echo "📦 安装PM2..."
npm install -g pm2

# 安装Nginx (可选，用于反向代理)
echo "📦 安装Nginx..."
apt install -y nginx

# 创建应用目录
echo "📁 创建应用目录..."
mkdir -p /var/www/email-service
cd /var/www/email-service

# 如果项目已存在，先停止服务
if pm2 list | grep -q "email-service"; then
    echo "🛑 停止现有服务..."
    pm2 stop email-service
    pm2 delete email-service
fi

# 这里需要您手动上传项目文件或使用git clone
echo "📥 请确保项目文件已上传到 /var/www/email-service"
echo "您可以使用以下命令之一："
echo "  1. git clone https://github.com/your-username/your-repo.git ."
echo "  2. scp -r /local/project/* root@your-server-ip:/var/www/email-service/"
echo ""
read -p "项目文件已准备好了吗？(y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "请先上传项目文件，然后重新运行此脚本"
    exit 1
fi

# 安装依赖
echo "📦 安装项目依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

# 创建日志目录
echo "📁 创建日志目录..."
mkdir -p /var/log/email-service
chown www-data:www-data /var/log/email-service

# 创建环境配置文件
if [ ! -f .env ]; then
    echo "⚙️ 创建环境配置文件..."
    cp .env.example .env
    echo "请编辑 .env 文件配置您的环境变量"
    echo "nano /var/www/email-service/.env"
    read -p "配置完成后按回车继续..."
fi

# 启动服务
echo "🚀 启动服务..."
pm2 start dist/main.js --name "email-service" --env production

# 设置开机自启
echo "⚙️ 设置开机自启..."
pm2 startup systemd -u root --hp /root
pm2 save

# 配置Nginx反向代理 (可选)
echo "🌐 配置Nginx反向代理..."
cat > /etc/nginx/sites-available/email-service << EOF
server {
    listen 80;
    server_name your-domain.com;  # 请替换为您的域名

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# 启用站点
ln -sf /etc/nginx/sites-available/email-service /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 配置防火墙
echo "🔒 配置防火墙..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 3000
ufw --force enable

echo "✅ 部署完成！"
echo ""
echo "📋 部署信息："
echo "  - 应用目录: /var/www/email-service"
echo "  - 日志目录: /var/log/email-service"
echo "  - 服务端口: 3000"
echo "  - Nginx配置: /etc/nginx/sites-available/email-service"
echo ""
echo "🔧 常用命令："
echo "  - 查看服务状态: pm2 status"
echo "  - 查看日志: pm2 logs email-service"
echo "  - 重启服务: pm2 restart email-service"
echo "  - 停止服务: pm2 stop email-service"
echo ""
echo "🌐 访问地址："
echo "  - 直接访问: http://your-server-ip:3000"
echo "  - 通过Nginx: http://your-domain.com"
echo ""
echo "⚠️  请记得："
echo "  1. 配置域名解析指向您的服务器IP"
echo "  2. 编辑 /etc/nginx/sites-available/email-service 中的域名"
echo "  3. 考虑配置SSL证书 (Let's Encrypt)"
