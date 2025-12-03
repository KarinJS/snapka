import express from '@karinjs/express'
import { loadConfig } from './config'
import { browserManager } from './browser'
import router from './routes'

/**
 * 创建并启动 Puppeteer Express 服务器
 */
async function startServer () {
  try {
    // 加载配置
    console.log('[Server] 正在加载配置...')
    const config = await loadConfig()
    console.log('[Server] 配置加载成功')

    // 初始化浏览器
    console.log('[Server] 正在初始化浏览器...')
    await browserManager.initialize(config.browser)
    console.log('[Server] 浏览器初始化成功')

    // 创建 Express 应用
    const app = express()

    // 中间件
    app.use(express.json({ limit: '50mb' }))
    app.use(express.urlencoded({ extended: true, limit: '50mb' }))

    // 请求日志中间件
    if (config.server?.enableLogging) {
      app.use((req, res, next) => {
        const start = Date.now()
        res.on('finish', () => {
          const duration = Date.now() - start
          console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`)
        })
        next()
      })
    }

    // 挂载路由
    app.use('/api', router)

    // 根路径
    app.get('/', (req, res) => {
      res.json({
        name: '@snapka/puppeteer-express',
        version: '0.0.1',
        engine: 'puppeteer',
        endpoints: {
          'POST /api/screenshot': '普通截图',
          'POST /api/screenshot/viewport': '分片截图',
          'GET /api/screenshot': '普通截图（URL参数）',
          'GET /api/screenshot/viewport': '分片截图（URL参数）',
          'GET /api/health': '健康检查',
          'POST /api/browser/restart': '重启浏览器',
        },
      })
    })

    // 错误处理中间件
    app.use((err: any, req: any, res: any, next: any) => {
      console.error('[Server] 错误:', err)
      res.status(500).json({
        status: 500,
        message: '服务器内部错误',
        error: err.message,
      })
    })

    // 启动服务器
    const port = config.server?.port || 3000
    const host = config.server?.host || '0.0.0.0'

    app.listen(port, host, () => {
      console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 Puppeteer Express Server                           ║
║                                                          ║
║   Server running at:                                    ║
║   ➜ Local:   http://localhost:${port.toString().padEnd(29)}║
║   ➜ Network: http://${host}:${port.toString().padEnd(29)}║
║                                                          ║
║   API Documentation:                                    ║
║   ➜ GET  /                 Service info                ║
║   ➜ GET  /api/health       Health check                ║
║   ➜ POST /api/screenshot   Take screenshot             ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
      `)
    })

    // 优雅关闭
    const shutdown = async () => {
      console.log('\n[Server] 正在关闭服务器...')
      await browserManager.close()
      console.log('[Server] 浏览器已关闭')
      process.exit(0)
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  } catch (error) {
    console.error('[Server] 服务器启动失败:', error)
    process.exit(1)
  }
}

// 启动服务器
startServer()
