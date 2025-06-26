# Weather MCP Server

一个基于 NestJS 和 Model Context Protocol (MCP) 的天气服务，使用 National Weather Service API 提供美国地区的天气预报和警报信息。

## 功能特性

- 🌤️ **城市天气预报**: 根据城市名称获取详细天气预报
- 📍 **坐标天气预报**: 根据经纬度坐标获取天气预报
- ⚠️ **天气警报**: 获取指定州的天气警报信息
- 🚀 **SSE 传输**: 支持 Server-Sent Events 实时通信
- 🏗️ **NestJS 架构**: 使用 NestJS 框架，支持依赖注入和模块化

## 快速开始

### 使用启动脚本（推荐）

```bash
./start.sh
```

这个脚本会自动：
1. 检查 Node.js 和 npm 是否安装
2. 安装项目依赖
3. 构建项目
4. 启动服务器

### 手动安装和运行

#### 1. 安装依赖

```bash
npm install
```

#### 2. 开发模式运行

```bash
npm run start:dev
```

#### 3. 生产模式运行

```bash
npm run build
npm run start:prod
```

### 测试服务

启动服务器后，可以使用测试脚本验证功能：

```bash
node test-weather.js
```

## API 端点

服务启动后，MCP 服务器将在以下端点提供服务：

- **SSE 连接**: `GET /sse`
- **消息处理**: `POST /messages`

## 可用工具

### 1. get-forecast-by-city

根据城市名称获取天气预报。

**参数:**
- `city` (string): 城市名称，例如 "New York", "Los Angeles", "Chicago"
- `state` (string, 可选): 两个字母的州代码，例如 "CA", "NY"

**示例:**
```json
{
  "city": "New York",
  "state": "NY"
}
```

### 2. get-forecast

根据经纬度坐标获取天气预报。

**参数:**
- `latitude` (number): 纬度 (-90 到 90)
- `longitude` (number): 经度 (-180 到 180)

**示例:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

### 3. get-alerts

获取指定州的天气警报。

**参数:**
- `state` (string): 两个字母的州代码，例如 "CA", "NY"

**示例:**
```json
{
  "state": "CA"
}
```

## 使用示例

### 客户端连接示例

```javascript
const EventSource = require('eventsource');

// 连接到 MCP 服务器
const eventSource = new EventSource('http://localhost:3000/sse');

eventSource.onopen = () => {
  console.log('Connected to MCP server');
  
  // 发送工具调用请求
  fetch('http://localhost:3000/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'get-forecast-by-city',
        arguments: {
          city: 'New York',
          state: 'NY'
        }
      }
    })
  });
};

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Weather data:', data);
};
```

### 完整示例

查看 `examples/client-example.js` 文件获取完整的使用示例。

## 技术架构

- **框架**: NestJS
- **MCP 库**: @rekog/mcp-nest
- **API**: National Weather Service (NWS) API
- **传输协议**: Server-Sent Events (SSE)
- **验证**: Zod

## 数据源

本服务使用 [National Weather Service API](https://api.weather.gov) 作为数据源，仅支持美国地区的天气信息。

## 开发

### 项目结构

```
src/
├── main.ts              # 应用程序入口
├── app.module.ts        # 根模块
└── weather/
    ├── weather.service.ts  # 天气服务逻辑
    ├── weather.tool.ts     # MCP 工具定义
    └── weather.service.spec.ts  # 测试文件
examples/
└── client-example.js    # 客户端使用示例
test-weather.js          # 功能测试脚本
start.sh                 # 启动脚本
```

### 添加新功能

1. 在 `weather.service.ts` 中添加新的服务方法
2. 在 `weather.tool.ts` 中使用 `@Tool` 装饰器定义新的工具
3. 确保在 `app.module.ts` 中注册新的服务

### 运行测试

```bash
# 单元测试
npm test

# 功能测试
node test-weather.js
```

## 许可证

MIT License