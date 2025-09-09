module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'TAPD飞书邮件服务运行正常',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
};
