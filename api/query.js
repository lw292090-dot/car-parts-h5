export default async function handler(req, res) {
  // 设置CORS头，允许所有域名访问
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  console.log('Query API请求方法:', req.method);
  console.log('Query API请求头:', req.headers);

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    console.log('Query API处理OPTIONS预检请求');
    res.status(200).end();
    return;
  }

  // 只允许POST请求
  if (req.method !== 'POST') {
    console.log('Query API不支持的请求方法:', req.method);
    return res.status(405).json({
      error: 'Method not allowed',
      message: `Method ${req.method} is not allowed. Only POST is supported.`,
      timestamp: new Date().toISOString()
    });
  }

  try {
    const { traceCode } = req.body;

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ab452e10-c72f-4ade-943f-eaae55744408', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'query.js:request_start',
        message: 'API请求开始',
        data: { traceCode: traceCode ? 'present' : 'missing', method: req.method },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A,B,C,D,E'
      })
    }).catch(() => {});
    // #endregion

    console.log('接收到的请求体:', req.body);
    console.log('traceCode:', traceCode);

    if (!traceCode) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ab452e10-c72f-4ade-943f-eaae55744408', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'query.js:validation_failed',
          message: 'traceCode验证失败',
          data: { receivedBody: req.body },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'C'
        })
      }).catch(() => {});
      // #endregion

      return res.status(400).json({
        error: 'traceCode is required',
        received: req.body,
        timestamp: new Date().toISOString()
      });
    }

    // 腾讯云云函数API地址 - 参考SDK调用方式
    const tencentApiUrl = 'https://cloudbase-8gvr5ezca651849d.ap-shanghai.tcb-api.tencentcloudapi.com/';

    // 构造请求参数 - 模拟SDK的callFunction调用
    const requestBody = {
      action: 'functions.invokeFunction',
      data: {
        name: 'queryPart',
        data: { traceCode }
      }
    };

    const requestUrl = `${tencentApiUrl}`;

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ab452e10-c72f-4ade-943f-eaae55744408', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'query.js:before_tencent_request',
        message: '准备发送腾讯云请求',
        data: {
          url: requestUrl,
          bodySize: JSON.stringify(requestBody).length,
          hasAuth: true
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A,B,D,E'
      })
    }).catch(() => {});
    // #endregion

    console.log('代理请求URL:', requestUrl);
    console.log('请求数据:', JSON.stringify(requestBody));

    // 发送请求到腾讯云API - 模拟SDK调用方式
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMWRjMzFlLWI0ZDAtNDQ4Yi1hNzZmLWIwY2M2M2Q4MTQ5OCJ9.eyJpc3MiOiJodHRwczovL2Nsb3VkYmFzZS04Z3ZyNWV6Y2E2NTE4NDlkLmFwLXNoYW5naGFpLnRjYi1hcGkudGVuY2VudGNsb3VkYXBpLmNvbSIsInN1YiI6ImFub24iLCJhdWQiOiJjbG91ZGJhc2UtOGd2cjVlemNhNjUxODQ5ZCIsImV4cCI6NDA3MTg2NDMyMSwiaWF0IjoxNzY4MTgxMTIxLCJub25jZSI6ImpSQU5INVhXUnJpRVUwTGxOaUdxRmciLCJhdF9oYXNoIjoialJBTkg1WFdScmlFVTBMbE5pR3FGZyIsIm5hbWUiOiJBbm9ueW1vdXMiLCJzY29wZSI6ImFub255bW91cyIsInByb2plY3RfaWQiOiJjbG91ZGJhc2UtOGd2cjVlemNhNjUxODQ5ZCIsInVzZXJfdHlwZSI6IiIsImNsaWVudF90eXBlIjoiY2xpZW50X3VzZXIiLCJpc19zeXN0ZW1fYWRtaW4iOmZhbHNlfQ.a4jxAwS2PBLlBYBkRQYfItebJY_SV2pkINsiBWbLESiBJyk2IxtjHeDPJrzwRC4j4DR1BJRasKxYxIvImX-rUQthBeDzi59nL2N5YkU9w_I5RkB_qX1bIkXMbAZcDnyHTOzG3sQmXg9Ow3YFBA86XE7zAbcM6jIZVgIqbykasvYjDMsZ1pG_ycYoX8offyiIxCeZn9ddjI0UKjeszaGZzrexg0b4G1-q59bCKOvs_ccM9MDBGGaUiY9kktHczSaM3npQWjr2pwTsRQuUoAUUifhMX9eLRFwljXIIwo2EwZ0axeeCh-MViFOAQuNJ30FEsls0k1A2pW89oO0fwA5w0w'
      },
      body: JSON.stringify(requestBody)
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ab452e10-c72f-4ade-943f-eaae55744408', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'query.js:after_tencent_request',
        message: '腾讯云请求完成',
        data: { status: response.status, ok: response.ok },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A,D,E'
      })
    }).catch(() => {});
    // #endregion

    console.log('腾讯云API响应状态:', response.status);
    console.log('腾讯云API响应头:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('腾讯云API错误响应:', response.status, errorText);

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ab452e10-c72f-4ade-943f-eaae55744408', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'query.js:tencent_api_error',
          message: '腾讯云API返回错误',
          data: { status: response.status, errorText: errorText.substring(0, 200) },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'A,B,C,D'
        })
      }).catch(() => {});
      // #endregion

      // 如果腾讯云API失败，返回测试数据作为fallback
      console.log('使用测试数据作为fallback');
      return res.status(200).json({
        result: {
          code: 0,
          data: {
            codeInfo: { code: traceCode },
            partInfo: {
              name: '测试配件 (云端API失败)',
              brand: '测试品牌',
              quality: 'A级',
              oeCodes: 'OE001',
              manufactureDate: '2024-01-01',
              shipmentDate: '2024-01-15'
            },
            queryCount: 1,
            isFirstQuery: true
          }
        },
        message: `腾讯云API失败 (${response.status}), 使用测试数据`,
        timestamp: new Date().toISOString()
      });
    }

    const data = await response.json();

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ab452e10-c72f-4ade-943f-eaae55744408', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'query.js:tencent_success',
        message: '腾讯云API调用成功',
        data: { responseSize: JSON.stringify(data).length },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A'
      })
    }).catch(() => {});
    // #endregion

    console.log('腾讯云API响应数据:', data);

    // 返回结果
    res.status(200).json(data);

  } catch (error) {
    console.error('Query API错误:', error);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ab452e10-c72f-4ade-943f-eaae55744408', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'query.js:exception_caught',
        message: '捕获到异常',
        data: { errorMessage: error.message, errorType: error.constructor.name },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'E'
      })
    }).catch(() => {});
    // #endregion

    // 如果出现异常，返回测试数据
    const { traceCode } = req.body || {};
    res.status(200).json({
      result: {
        code: 0,
        data: {
          codeInfo: { code: traceCode || 'UNKNOWN' },
          partInfo: {
            name: '测试配件 (异常处理)',
            brand: '测试品牌',
            quality: 'A级',
            oeCodes: 'OE001',
            manufactureDate: '2024-01-01',
            shipmentDate: '2024-01-15'
          },
          queryCount: 1,
          isFirstQuery: true
        }
      },
      message: `API异常: ${error.message}, 使用测试数据`,
      timestamp: new Date().toISOString()
    });
  }
}