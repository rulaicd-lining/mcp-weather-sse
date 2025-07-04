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
      state: z
        .string()
        .length(2)
        .describe('Two-letter state code (e.g. CA, NY)'),
    }),
    outputSchema: z.object({
      alerts: z.array(
        z.object({
          event: z.string().optional().describe('Type of weather event'),
          areaDesc: z
            .string()
            .optional()
            .describe('Description of the affected area'),
          severity: z
            .string()
            .optional()
            .describe('Severity level of the alert'),
          status: z.string().optional().describe('Current status of the alert'),
          headline: z.string().optional().describe('Alert headline or title'),
        }),
      ),
    }),
  })
  async getAlerts({ state }: { state: string }) {
    return this.weatherService.getAlerts(state);
  }

  @Tool({
    name: 'get-forecast',
    description: 'Get weather forecast for a given location by coordinates',
    parameters: z.object({
      latitude: z
        .number()
        .min(-90)
        .max(90)
        .describe('Latitude of the location'),
      longitude: z
        .number()
        .min(-180)
        .max(180)
        .describe('Longitude of the location'),
    }),
    outputSchema: z.object({
      periods: z.array(
        z.object({
          name: z
            .string()
            .optional()
            .describe('Period name (e.g. Tonight, Tomorrow)'),
          temperature: z.number().optional().describe('Temperature value'),
          temperatureUnit: z
            .string()
            .optional()
            .describe('Temperature unit (F or C)'),
          windSpeed: z.string().optional().describe('Wind speed description'),
          windDirection: z.string().optional().describe('Wind direction'),
          shortForecast: z
            .string()
            .optional()
            .describe('Brief weather forecast'),
          detailedForecast: z
            .string()
            .optional()
            .describe('Detailed weather forecast'),
        }),
      ),
    }),
  })
  async getForecast({
    latitude,
    longitude,
  }: {
    latitude: number;
    longitude: number;
  }) {
    return this.weatherService.getForecast(latitude, longitude);
  }

  @Tool({
    name: 'get-forecast-by-city',
    description:
      'Get weather forecast for a city by name using geocoding and National Weather Service API',
    parameters: z.object({
      city: z
        .string()
        .min(1)
        .describe('City name (e.g. New York, Los Angeles)'),
      state: z
        .string()
        .length(2)
        .optional()
        .describe('Two-letter state code (optional, e.g. CA, NY)'),
    }),
    outputSchema: z.object({
      periods: z.array(
        z.object({
          name: z
            .string()
            .optional()
            .describe('Period name (e.g. Tonight, Tomorrow)'),
          temperature: z.number().optional().describe('Temperature value'),
          temperatureUnit: z
            .string()
            .optional()
            .describe('Temperature unit (F or C)'),
          windSpeed: z.string().optional().describe('Wind speed description'),
          windDirection: z.string().optional().describe('Wind direction'),
          shortForecast: z
            .string()
            .optional()
            .describe('Brief weather forecast'),
          detailedForecast: z
            .string()
            .optional()
            .describe('Detailed weather forecast'),
        }),
      ),
    }),
  })
  async getForecastByCity({ city, state }: { city: string; state?: string }) {
    return this.weatherService.getForecastByCity(city, state);
  }

  @Tool({
    name: 'get-coordinates-by-city',
    description: 'Get coordinates for a city using geocode.maps.co API',
    parameters: z.object({
      city: z
        .string()
        .min(1)
        .describe('City name (e.g. New York, London, Tokyo, Beijing)'),
      state: z.string().optional().describe('State or region name (optional)'),
    }),
    outputSchema: z.object({
      name: z.string().describe('City name'),
      latitude: z.number().describe('Latitude of the city'),
      longitude: z.number().describe('Longitude of the city'),
    }),
  })
  async getCoordinatesByCity({
    city,
    state,
  }: {
    city: string;
    state?: string;
  }) {
    return this.weatherService.getCoordinatesByCity(city, state);
  }
}
