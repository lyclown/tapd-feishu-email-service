const express = require('express');
const cors = require('cors');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'TAPD飞书邮件服务运行正常',
    timestamp: new Date().toISOString()
  });
});

// 项目配置
app.get('/email/project-configs', (req, res) => {
  res.json([
    {
      workspaceId: '64029412',
      config: {
        projectName: '工时评审系统',
        responsibleEmail: 'liyao@chinahuanong.com.cn',
        responsibleName: '项目经理',
        emailEnabled: true
      }
    }
  ]);
});

// 邮件发送接口（简化版）
app.post('/email/send-requirement-confirmation', (req, res) => {
  const { workspace_id, story_name, attachment_url } = req.body;
  
  // 基本验证
  if (!workspace_id || !story_name || !attachment_url) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['workspace_id', 'story_name', 'attachment_url']
    });
  }
  
  // 模拟邮件发送成功
  res.json({
    success: true,
    message: '邮件发送成功（演示模式）',
    data: {
      workspace_id,
      story_name,
      attachment_url,
      recipient: 'liyao@chinahuanong.com.cn',
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = app;
