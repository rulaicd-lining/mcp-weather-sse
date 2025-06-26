// 示例：如何使用 Weather MCP Server
// 这个示例展示了如何连接到 MCP 服务器并调用天气工具

const EventSource = require('eventsource');

// MCP 服务器端点
const SSE_ENDPOINT = 'http://localhost:3000/sse';
const MESSAGES_ENDPOINT = 'http://localhost:3000/messages';

// 连接到 SSE 端点
const eventSource = new EventSource(SSE_ENDPOINT);

eventSource.onopen = () => {
  console.log('Connected to MCP server');
  
  // 示例：获取纽约的天气预报
  getForecastByCity('New York', 'NY');
};

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

eventSource.onerror = (error) => {
  console.error('SSE Error:', error);
};

// 发送消息到 MCP 服务器
async function sendMessage(message) {
  try {
    const response = await fetch(MESSAGES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    
    const result = await response.json();
    console.log('Response:', result);
    return result;
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// 示例：根据城市获取天气预报
async function getForecastByCity(city, state) {
  const message = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'get-forecast-by-city',
      arguments: {
        city: city,
        state: state,
      },
    },
  };
  
  console.log(`Getting forecast for ${city}, ${state}...`);
  return await sendMessage(message);
}

// 示例：根据坐标获取天气预报
async function getForecastByCoordinates(latitude, longitude) {
  const message = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'get-forecast',
      arguments: {
        latitude: latitude,
        longitude: longitude,
      },
    },
  };
  
  console.log(`Getting forecast for coordinates: ${latitude}, ${longitude}...`);
  return await sendMessage(message);
}

// 示例：获取天气警报
async function getAlerts(state) {
  const message = {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'get-alerts',
      arguments: {
        state: state,
      },
    },
  };
  
  console.log(`Getting alerts for ${state}...`);
  return await sendMessage(message);
}

// 示例：获取城市坐标
async function getCoordinatesByCity(city, state) {
  const message = {
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'get-coordinates-by-city',
      arguments: {
        city: city,
        state: state,
      },
    },
  };
  
  console.log(`Getting coordinates for ${city}${state ? `, ${state}` : ''}...`);
  return await sendMessage(message);
}

// 使用示例
setTimeout(() => {
  // 获取纽约天气预报
  getForecastByCity('New York', 'NY');
  
  // 获取洛杉矶天气预报（不指定州）
  setTimeout(() => {
    getForecastByCity('Los Angeles');
  }, 2000);
  
  // 获取伦敦天气预报（国际城市）
  setTimeout(() => {
    getForecastByCity('London');
  }, 4000);
  
  // 获取东京坐标
  setTimeout(() => {
    getCoordinatesByCity('Tokyo');
  }, 6000);
  
  // 获取坐标天气预报
  setTimeout(() => {
    getForecastByCoordinates(40.7128, -74.0060);
  }, 8000);
  
  // 获取加州天气警报
  setTimeout(() => {
    getAlerts('CA');
  }, 10000);
}, 1000);

// 清理函数
process.on('SIGINT', () => {
  console.log('Closing connection...');
  eventSource.close();
  process.exit(0);
}); 