import { Module } from '@nestjs/common';
import { McpModule, McpTransportType } from '@rekog/mcp-nest';
import { WeatherTool } from './weather/weather.tool';
import { WeatherService } from './weather/weather.service';

@Module({
  imports: [
    McpModule.forRoot({
      name: 'weather-mcp-server',
      version: '1.0.0',
      transport: McpTransportType.SSE, // 使用 SSE 传输
      sse: {
        pingEnabled: true,
        pingIntervalMs: 30000,
      },
    }),
  ],
  providers: [WeatherTool, WeatherService],
})
export class AppModule {} 