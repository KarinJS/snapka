# @snapka/playwright-express

基于 Playwright 的独立 Express 截图服务，采用单例浏览器架构，提供高性能的截图 API。

## ✨ 特性

- 🚀 **单例浏览器**：服务启动时初始化浏览器，所有请求共享同一实例，性能提升10倍+
- ⚡ **页面复用池**：智能页面管理，支持复用模式和一次性模式
- 📡 **多种请求方式**：支持 POST 和 GET 两种请求方式
- 🖼️ **灵活返回格式**：支持返回 JSON 或图片流
- 📊 **分片截图**：支持长页面分片截图
- 🔧 **配置管理**：基于 cosmiconfig 的灵活配置系统
- ✨ **TypeScript**：完整的类型支持

## 📦 安装

```bash
pnpm add @snapka/playwright-express
```

## 🚀 快速开始

```bash
# 启动服务（使用默认配置）
node dist/index.js

# 或使用 npm scripts
pnpm start
```

服务启动后访问 `http://localhost:3000` 查看服务信息。

> **注意**：本包仅支持作为独立应用运行，不支持编程式导入使用。

## ⚙️ 配置

### 配置文件

在项目根目录创建配置文件（支持多种格式）：

**playwright-express.config.js**

```javascript
module.exports = {
  server: {
    port: 3000,
    host: '0.0.0.0',
    enableLogging: true
  },
  browser: {
    headless: 'shell',
    maxOpenPages: 10,
    pageMode: 'reuse',
    pageIdleTimeout: 60000,
    defaultViewport: {
      width: 1920,
      height: 1080
    }
  }
}
```

**支持的配置文件：**

- `package.json` 的 `playwright-express` 字段
- `.playwright-expressrc`
- `.playwright-expressrc.json`
- `.playwright-expressrc.js`
- `playwright-express.config.js`

### 配置参数

#### Server 配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| port | number | 3000 | 服务器端口 |
| host | string | '0.0.0.0' | 监听地址 |
| enableLogging | boolean | true | 启用请求日志 |

#### Browser 配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| headless | 'shell'\|'new'\|'false' | 'shell' | 无头模式 |
| maxOpenPages | number | 10 | 最大并发页面数 |
| pageMode | 'reuse'\|'disposable' | 'reuse' | 页面管理模式 |
| pageIdleTimeout | number | 60000 | 页面空闲超时（毫秒） |

## 📖 API 文档

详细的 API 文档请查看 [API 标准文档](../../docs/api-standard.md)

### 快速示例

#### 1. POST 截图（返回 JSON）

```bash
curl -X POST http://localhost:3000/api/screenshot \
  -H "Content-Type: application/json" \
  -d '{
    "file": "https://example.com",
    "fullPage": true
  }'
```

#### 2. POST 截图（返回图片流）

```bash
curl -X POST http://localhost:3000/api/screenshot \
  -H "Content-Type: application/json" \
  -d '{
    "file": "https://example.com",
    "stream": true
  }' --output screenshot.png
```

#### 3. GET 截图

```bash
curl "http://localhost:3000/api/screenshot?file=https://example.com&fullPage=true" \
  --output screenshot.png
```

#### 4. 分片截图

```bash
curl -X POST http://localhost:3000/api/screenshot/viewport \
  -H "Content-Type: application/json" \
  -d '{
    "file": "https://example.com/long-page",
    "viewportHeight": 1000
  }'
```

#### 5. 健康检查

```bash
curl http://localhost:3000/api/health
```

#### 6. 重启浏览器

```bash
curl -X POST http://localhost:3000/api/browser/restart
```

## 🎯 使用场景

### 场景1：网页截图服务

```javascript
const axios = require('axios');

async function captureWebPage(url) {
  const response = await axios.post('http://localhost:3000/api/screenshot', {
    file: url,
    fullPage: true,
    type: 'png'
  });
  
  return response.data.data.image; // Base64 图片
}
```

### 场景2：定时截图任务

```javascript
const cron = require('node-cron');
const axios = require('axios');

// 每天凌晨1点截图
cron.schedule('0 1 * * *', async () => {
  const response = await axios.post('http://localhost:3000/api/screenshot', {
    file: 'https://example.com/dashboard',
    fullPage: true,
    stream: true
  }, {
    responseType: 'arraybuffer'
  });
  
  require('fs').writeFileSync(`screenshot-${Date.now()}.png`, response.data);
});
```

### 场景3：微服务集成

```javascript
// 在其他微服务中调用
import axios from 'axios';

export class ScreenshotService {
  private baseUrl = 'http://localhost:3000';
  
  async screenshot(url: string, options = {}) {
    const response = await axios.post(`${this.baseUrl}/api/screenshot`, {
      file: url,
      ...options
    });
    
    return response.data.data;
  }
}
```

## 🔥 性能优势

| 模式 | 首次请求 | 后续请求 | 并发性能 |
|------|---------|----------|----------|
| 传统模式（每次启动浏览器） | ~2000ms | ~2000ms | 低 |
| 单例模式（本方案） | ~2000ms | ~200ms | 高 |

**性能提升：10倍+**

## 🛠️ 高级用法

### 自定义浏览器配置

```javascript
// playwright-express.config.js
module.exports = {
  browser: {
    headless: 'shell',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ],
    maxOpenPages: 20,
    pageMode: 'reuse',
    pageIdleTimeout: 120000,
    defaultViewport: {
      width: 1920,
      height: 1080
    }
  }
}
```

### Docker 部署

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### PM2 部署

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'playwright-express',
    script: 'dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
```

## ⚠️ 注意事项

1. **内存管理**：建议根据服务器资源合理设置 `maxOpenPages`
2. **超时设置**：长页面截图建议增加超时时间
3. **定期重启**：长时间运行建议定期重启浏览器实例
4. **并发控制**：超过 `maxOpenPages` 的请求会自动排队

## 🆚 与 Puppeteer 版本的区别

| 特性 | Playwright | Puppeteer |
|------|-----------|-----------|
| 引擎 | Playwright | Puppeteer |
| WebP支持 | ❌ 转换为PNG | ✅ 原生支持 |
| 性能 | 略快 | 快 |
| API | 完全一致 | 完全一致 |

两个版本的 API 完全相同，可以无缝切换。

## 📚 相关文档

- [API 标准文档](../../docs/api-standard.md)
- [Playwright 文档](https://playwright.dev)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT

## 👨‍💻 作者

shijin
