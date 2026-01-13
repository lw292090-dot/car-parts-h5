export default async function handler(req, res) {
  // 设置CORS头，允许所有域名访问
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { traceCode } = req.body;

    if (!traceCode) {
      return res.status(400).json({ error: 'traceCode is required' });
    }

    // 腾讯云云函数API地址
    const tencentApiUrl = 'https://cloudbase-8gvr5ezca651849d.ap-shanghai.tcb-api.tencentcloudapi.com/web';

    // 构造请求参数
    const params = new URLSearchParams({
      env: 'cloudbase-8gvr5ezca651849d',
      action: 'functions.invokeFunction',
      name: 'queryPart',
      data: JSON.stringify({ traceCode })
    });

    const requestUrl = `${tencentApiUrl}?${params}`;

    console.log('代理请求URL:', requestUrl);

    // 发送请求到腾讯云API
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 如果需要身份验证，可以在这里添加Authorization头
        // 'Authorization': 'Bearer YOUR_TOKEN'
      },
      // 如果腾讯云API需要请求体，可以在这里添加
      // body: JSON.stringify({ traceCode })
    });

    if (!response.ok) {
      throw new Error(`腾讯云API响应错误: ${response.status}`);
    }

    const data = await response.json();

    console.log('腾讯云API响应:', data);

    // 返回结果
    res.status(200).json(data);

  } catch (error) {
    console.error('代理请求失败:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}