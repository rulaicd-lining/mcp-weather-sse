import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { WeatherService } from './weather.service';

@Injectable()
export class WeatherTool {
  constructor(private readonly weatherService: WeatherService) {}

  @Tool({
    name: 'get-alerts',
    description: '获取某个州的天气警报',
    parameters: z.object({
      state: z.string().length(2).describe('两个字母的州代码（例如 CA、NY）'),
    }),
  })
  async getAlerts({ state }: { state: string }) {
    return this.weatherService.getAlerts(state);
  }

  @Tool({
    name: 'get-forecast',
    description: '获取某个位置的天气预报',
    parameters: z.object({
      latitude: z.number().min(-90).max(90).describe('位置的纬度'),
      longitude: z.number().min(-180).max(180).describe('位置的经度'),
    }),
  })
  async getForecast({ latitude, longitude }: { latitude: number; longitude: number }) {
    return this.weatherService.getForecast(latitude, longitude);
  }
} 