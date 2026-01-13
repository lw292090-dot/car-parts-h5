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

    // 构造请求参数 - 根据腾讯云云开发的API格式
    const params = new URLSearchParams({
      env: 'cloudbase-8gvr5ezca651849d',
      action: 'functions.invokeFunction',
      name: 'queryPart'
    });

    const requestUrl = `${tencentApiUrl}?${params}`;

    console.log('代理请求URL:', requestUrl);
    console.log('请求体:', JSON.stringify({ traceCode }));

    // 发送请求到腾讯云API
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMWRjMzFlLWI0ZDAtNDQ4Yi1hNzZmLWIwY2M2M2Q4MTQ5OCJ9.eyJpc3MiOiJodHRwczovL2Nsb3VkYmFzZS04Z3ZyNWV6Y2E2NTE4NDlkLmFwLXNoYW5naGFpLnRjYi1hcGkudGVuY2VudGNsb3VkYXBpLmNvbSIsInN1YiI6ImFub24iLCJhdWQiOiJjbG91ZGJhc2UtOGd2cjVlemNhNjUxODQ5ZCIsImV4cCI6NDA3MTg2NDMyMSwiaWF0IjoxNzY4MTgxMTIxLCJub25jZSI6ImpSQU5INVhXUnJpRVUwTGxOaUdxRmciLCJhdF9oYXNoIjoialJBTkg1WFdScmlFVTBMbE5pR3FGZyIsIm5hbWUiOiJBbm9ueW1vdXMiLCJzY29wZSI6ImFub255bW91cyIsInByb2plY3RfaWQiOiJjbG91ZGJhc2UtOGd2cjVlemNhNjUxODQ5ZCIsInVzZXJfdHlwZSI6IiIsImNsaWVudF90eXBlIjoiY2xpZW50X3VzZXIiLCJpc19zeXN0ZW1fYWRtaW4iOmZhbHNlfQ.a4jxAwS2PBLlBYBkRQYfItebJY_SV2pkINsiBWbLESiBJyk2IxtjHeDPJrzwRC4j4DR1BJRasKxYxIvImX-rUQthBeDzi59nL2N5YkU9w_I5RkB_qX1bIkXMbAZcDnyHTOzG3sQmXg9Ow3YFBA86XE7zAbcM6jIZVgIqbykasvYjDMsZ1pG_ycYoX8offyiIxCeZn9ddjI0UKjeszaGZzrexg0b4G1-q59bCKOvs_ccM9MDBGGaUiY9kktHczSaM3npQWjr2pwTsRQuUoAUUifhMX9eLRFwljXIIwo2EwZ0axeeCh-MViFOAQuNJ30FEsls0k1A2pW89oO0fwA5w0w'
      },
      body: JSON.stringify({ traceCode })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('腾讯云API错误响应:', response.status, errorText);
      throw new Error(`腾讯云API响应错误: ${response.status} - ${errorText}`);
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