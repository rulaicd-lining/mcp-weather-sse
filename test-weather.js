// 简单的天气服务测试脚本
// 这个脚本用于测试天气服务的基本功能

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testWeatherService() {
  console.log('🌤️  Testing Weather MCP Server...\n');

  try {
    // 测试 1: 检查服务器是否运行
    console.log('1. Testing server availability...');
    const healthResponse = await fetch(`${BASE_URL}/sse`);
    if (healthResponse.ok) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server is not responding');
      return;
    }

    // 测试 2: 测试城市天气预报
    console.log('\n2. Testing city weather forecast...');
    const cityForecastResponse = await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

    if (cityForecastResponse.ok) {
      const cityData = await cityForecastResponse.json();
      console.log('✅ City forecast test passed');
      console.log('   Response received:', cityData.result ? 'Yes' : 'No');
    } else {
      console.log('❌ City forecast test failed');
    }

    // 测试 3: 测试国际城市天气预报
    console.log('\n3. Testing international city weather forecast...');
    const intlForecastResponse = await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'get-forecast-by-city',
          arguments: {
            city: 'London'
          }
        }
      })
    });

    if (intlForecastResponse.ok) {
      const intlData = await intlForecastResponse.json();
      console.log('✅ International city forecast test passed');
      console.log('   Response received:', intlData.result ? 'Yes' : 'No');
    } else {
      console.log('❌ International city forecast test failed');
    }

    // 测试 4: 测试坐标查询
    console.log('\n4. Testing coordinates lookup...');
    const coordsResponse = await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'get-coordinates-by-city',
          arguments: {
            city: 'Tokyo'
          }
        }
      })
    });

    if (coordsResponse.ok) {
      const coordsData = await coordsResponse.json();
      console.log('✅ Coordinates lookup test passed');
      console.log('   Response received:', coordsData.result ? 'Yes' : 'No');
    } else {
      console.log('❌ Coordinates lookup test failed');
    }

    // 测试 5: 测试坐标天气预报
    console.log('\n5. Testing coordinate weather forecast...');
    const coordForecastResponse = await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'get-forecast',
          arguments: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        }
      })
    });

    if (coordForecastResponse.ok) {
      const coordData = await coordForecastResponse.json();
      console.log('✅ Coordinate forecast test passed');
      console.log('   Response received:', coordData.result ? 'Yes' : 'No');
    } else {
      console.log('❌ Coordinate forecast test failed');
    }

    // 测试 6: 测试天气警报
    console.log('\n6. Testing weather alerts...');
    const alertsResponse = await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
          name: 'get-alerts',
          arguments: {
            state: 'CA'
          }
        }
      })
    });

    if (alertsResponse.ok) {
      const alertsData = await alertsResponse.json();
      console.log('✅ Weather alerts test passed');
      console.log('   Response received:', alertsData.result ? 'Yes' : 'No');
    } else {
      console.log('❌ Weather alerts test failed');
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n💡 Make sure the server is running on http://localhost:3000');
  }
}

// 运行测试
testWeatherService(); 