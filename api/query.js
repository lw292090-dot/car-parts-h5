export default function handler(req, res) {
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

    console.log('接收到的请求体:', req.body);
    console.log('traceCode:', traceCode);

    if (!traceCode) {
      return res.status(400).json({
        error: 'traceCode is required',
        received: req.body,
        timestamp: new Date().toISOString()
      });
    }

    // 暂时先返回一个测试响应
    res.status(200).json({
      result: {
        code: 0,
        data: {
          codeInfo: { code: traceCode },
          partInfo: {
            name: '测试配件',
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
      message: 'Query API工作正常！',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Query API错误:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}