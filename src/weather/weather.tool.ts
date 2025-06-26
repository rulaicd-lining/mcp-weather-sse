import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { WeatherService } from './weather.service';

@Injectable()
export class WeatherTool {
  constructor(private readonly weatherService: WeatherService) {}

  @Tool({
    name: 'get-alerts',
    description: 'Get weather alerts for a given state',
    parameters: z.object({
      state: z.string().length(2).describe('Two-letter state code (e.g. CA, NY)'),
    }),
  })
  async getAlerts({ state }: { state: string }) {
    return this.weatherService.getAlerts(state);
  }

  @Tool({
    name: 'get-forecast',
    description: 'Get weather forecast for a given location',
    parameters: z.object({
      latitude: z.number().min(-90).max(90).describe('Latitude of the location'),
      longitude: z.number().min(-180).max(180).describe('Longitude of the location'),
    }),
  })
  async getForecast({ latitude, longitude }: { latitude: number; longitude: number }) {
    return this.weatherService.getForecast(latitude, longitude);
  }
} 