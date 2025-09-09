#!/bin/bash

# 快速部署脚本
# 支持多种云服务平台

set -e

echo "🚀 邮件服务快速部署脚本"
echo "=========================="

# 检查Git状态
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  检测到未提交的更改，是否继续？(y/n)"
    read -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "请先提交您的更改"
        exit 1
    fi
fi

echo "请选择部署平台："
echo "1) Vercel (免费)"
echo "2) Railway (免费额度)"
echo "3) Render (免费层)"
echo "4) 腾讯云轻量服务器"
echo "5) 华为云ECS"

read -p "请输入选择 (1-5): " choice

case $choice in
    1)
        echo "🔄 准备Vercel部署..."
        
        # 检查是否安装了Vercel CLI
        if ! command -v vercel &> /dev/null; then
            echo "📦 安装Vercel CLI..."
            npm install -g vercel
        fi
        
        # 构建项目
        echo "🔨 构建项目..."
        npm run build
        
        # 部署到Vercel
        echo "🚀 部署到Vercel..."
        vercel --prod
        
        echo "✅ Vercel部署完成！"
        echo "📋 请在Vercel控制台配置环境变量"
        ;;
        
    2)
        echo "🔄 准备Railway部署..."
        
        # 检查是否安装了Railway CLI
        if ! command -v railway &> /dev/null; then
            echo "📦 安装Railway CLI..."
            npm install -g @railway/cli
        fi
        
        # 登录Railway
        railway login
        
        # 初始化项目
        railway init
        
        # 部署
        railway up
        
        echo "✅ Railway部署完成！"
        ;;
        
    3)
        echo "🔄 准备Render部署..."
        echo "请手动访问 https://render.com/ 进行部署"
        echo "构建命令: npm run build"
        echo "启动命令: npm run start:prod"
        ;;
        
    4)
        echo "🔄 准备腾讯云部署..."
        read -p "请输入服务器IP: " server_ip
        read -p "请输入SSH用户名 (默认: ubuntu): " ssh_user
        ssh_user=${ssh_user:-ubuntu}
        
        # 上传项目文件
        echo "📤 上传项目文件..."
        rsync -avz --exclude node_modules --exclude .git . $ssh_user@$server_ip:~/email-service/
        
        # 远程部署
        ssh $ssh_user@$server_ip << 'EOF'
            cd ~/email-service
            
            # 安装Node.js (如果未安装)
            if ! command -v node &> /dev/null; then
                curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                sudo apt-get install -y nodejs
            fi
            
            # 安装依赖
            npm install
            
            # 构建项目
            npm run build
            
            # 安装PM2 (如果未安装)
            if ! command -v pm2 &> /dev/null; then
                sudo npm install -g pm2
            fi
            
            # 停止旧服务
            pm2 stop email-service || true
            pm2 delete email-service || true
            
            # 启动新服务
            pm2 start dist/main.js --name email-service
            
            # 保存PM2配置
            pm2 save
            
            echo "✅ 腾讯云部署完成！"
            echo "🌐 访问地址: http://$server_ip:3000"
EOF
        ;;
        
    5)
        echo "🔄 准备华为云部署..."
        echo "部署流程与腾讯云类似，请参考腾讯云部署步骤"
        ;;
        
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "🎉 部署完成！"
echo ""
echo "📋 后续步骤："
echo "1. 配置环境变量"
echo "2. 测试API接口"
echo "3. 在飞书中配置新的URL"
echo ""
echo "🔗 测试接口："
echo "- 健康检查: GET /health"
echo "- 项目配置: GET /email/project-configs"  
echo "- 邮件测试: GET /email/test-connection"
echo "- 发送邮件: POST /email/send-requirement-confirmation"
