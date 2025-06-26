import { Injectable } from '@nestjs/common';
import { z } from 'zod';

const NWS_API_BASE = 'https://api.weather.gov';
const GEOCODE_API_BASE = 'https://geocode.maps.co';
const GEOCODE_API_KEY = '685cbcaf6b2c6204928522ftp68c29c';
const USER_AGENT = 'weather-app/1.0';

interface AlertFeature {
  properties: {
    event?: string;
    areaDesc?: string;
    severity?: string;
    status?: string;
    headline?: string;
  };
}

interface ForecastPeriod {
  name?: string;
  temperature?: number;
  temperatureUnit?: string;
  windSpeed?: string;
  windDirection?: string;
  shortForecast?: string;
  detailedForecast?: string;
}

interface AlertsResponse {
  features: AlertFeature[];
}

interface PointsResponse {
  properties: {
    forecast?: string;
    relativeLocation?: {
      properties?: {
        city?: string;
        state?: string;
      };
    };
  };
}

interface ForecastResponse {
  properties: {
    periods: ForecastPeriod[];
  };
}

interface GeocodingFeature {
  properties: {
    name?: string;
    state?: string;
    country?: string;
  };
  geometry: {
    coordinates: [number, number]; // [longitude, latitude]
  };
}

interface GeocodingResponse {
  features: GeocodingFeature[];
}

interface GeocodeMapsResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
}

@Injectable()
export class WeatherService {
  private async makeNWSRequest<T>(url: string): Promise<T | null> {
    const headers = {
      'User-Agent': USER_AGENT,
      'Accept': 'application/geo+json',
    };

    try {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return (await response.json()) as T;
    } catch (error) {
      console.error('Error making NWS request:', error);
      return null;
    }
  }

  private async makeGeocodeRequest<T>(url: string): Promise<T | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return (await response.json()) as T;
    } catch (error) {
      console.error('Error making geocode request:', error);
      return null;
    }
  }

  private formatAlert(feature: AlertFeature): string {
    const props = feature.properties;
    return [
      `Event: ${props.event || 'Unknown'}`,
      `Area: ${props.areaDesc || 'Unknown'}`,
      `Severity: ${props.severity || 'Unknown'}`,
      `Status: ${props.status || 'Unknown'}`,
      `Headline: ${props.headline || 'No headline'}`,
      '---',
    ].join('\n');
  }

  private formatForecastPeriod(period: ForecastPeriod): string {
    return [
      `${period.name || 'Unknown'}:`,
      `Temperature: ${period.temperature || 'Unknown'}°${period.temperatureUnit || 'F'}`,
      `Wind: ${period.windSpeed || 'Unknown'} ${period.windDirection || ''}`,
      `Forecast: ${period.shortForecast || 'No forecast available'}`,
      period.detailedForecast ? `Details: ${period.detailedForecast}` : '',
      '---',
    ].filter(Boolean).join('\n');
  }

  async getAlerts(state: string) {
    const stateCode = state.toUpperCase();
    const alertsUrl = `${NWS_API_BASE}/alerts?area=${stateCode}`;
    const alertsData = await this.makeNWSRequest<AlertsResponse>(alertsUrl);

    if (!alertsData) {
      return {
        content: [
          {
            type: 'text',
            text: 'Failed to retrieve alerts data',
          },
        ],
      };
    }

    const features = alertsData.features || [];
    if (features.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No active alerts for ${stateCode}`,
          },
        ],
      };
    }

    const formattedAlerts = features.map(this.formatAlert);
    const alertsText = `Active alerts for ${stateCode}:\n\n${formattedAlerts.join('\n')}`;

    return {
      content: [
        {
          type: 'text',
          text: alertsText,
        },
      ],
    };
  }

  async getForecast(latitude: number, longitude: number) {
    const pointsUrl = `${NWS_API_BASE}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    const pointsData = await this.makeNWSRequest<PointsResponse>(pointsUrl);

    if (!pointsData) {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to retrieve grid point data for coordinates: ${latitude}, ${longitude}. This location may not be supported by the NWS API (only US locations are supported).`,
          },
        ],
      };
    }

    const forecastUrl = pointsData.properties?.forecast;
    if (!forecastUrl) {
      return {
        content: [
          {
            type: 'text',
            text: 'Failed to get forecast URL from grid point data',
          },
        ],
      };
    }

    const forecastData = await this.makeNWSRequest<ForecastResponse>(forecastUrl);
    if (!forecastData) {
      return {
        content: [
          {
            type: 'text',
            text: 'Failed to retrieve forecast data',
          },
        ],
      };
    }

    const periods = forecastData.properties?.periods || [];
    if (periods.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: 'No forecast periods available',
          },
        ],
      };
    }

    const formattedForecast = periods.map(this.formatForecastPeriod);
    const forecastText = `Forecast for ${latitude}, ${longitude}:\n\n${formattedForecast.join('\n')}`;

    return {
      content: [
        {
          type: 'text',
          text: forecastText,
        },
      ],
    };
  }

  async getForecastByCity(city: string, state?: string) {
    // 首先尝试使用 geocode.maps.co 获取坐标
    const geocodeQuery = state ? `${city}, ${state}` : city;
    const geocodeUrl = `${GEOCODE_API_BASE}/search?q=${encodeURIComponent(geocodeQuery)}&api_key=${GEOCODE_API_KEY}`;
    
    const geocodeData = await this.makeGeocodeRequest<GeocodeMapsResponse[]>(geocodeUrl);

    if (geocodeData && geocodeData.length > 0) {
      // 使用 geocode.maps.co 的结果
      const location = geocodeData[0];
      const latitude = parseFloat(location.lat);
      const longitude = parseFloat(location.lon);
      const displayName = location.display_name;

      // 检查是否是美国地区（NWS API 只支持美国）
      const isUSLocation = displayName.includes('United States') || 
                          displayName.includes('USA') || 
                          displayName.includes('US');

      if (isUSLocation) {
        // 使用 NWS API 获取天气预报
        return await this.getForecast(latitude, longitude);
      } else {
        // 非美国地区，返回坐标信息
        return {
          content: [
            {
              type: 'text',
              text: `Location found: ${displayName}\nCoordinates: ${latitude}, ${longitude}\n\nNote: Weather forecast is only available for US locations through the National Weather Service API. For international locations, you may need to use a different weather service.`,
            },
          ],
        };
      }
    }

    // 如果 geocode.maps.co 失败，回退到 NWS 地理编码（仅限美国）
    let nwsGeocodingQuery = city;
    if (state) {
      nwsGeocodingQuery += `, ${state}`;
    }
    nwsGeocodingQuery += ', USA';

    const nwsGeocodingUrl = `${NWS_API_BASE}/geocoding/addresses?q=${encodeURIComponent(nwsGeocodingQuery)}`;
    const nwsGeocodingData = await this.makeNWSRequest<GeocodingResponse>(nwsGeocodingUrl);

    if (!nwsGeocodingData || !nwsGeocodingData.features || nwsGeocodingData.features.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `Could not find location for "${city}"${state ? `, ${state}` : ''}. Please check the city name and try again.`,
          },
        ],
      };
    }

    // 获取第一个匹配的位置
    const location = nwsGeocodingData.features[0];
    const [longitude, latitude] = location.geometry.coordinates;
    const locationName = location.properties?.name || city;
    const locationState = location.properties?.state || state;

    // 获取天气预报
    const pointsUrl = `${NWS_API_BASE}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    const pointsData = await this.makeNWSRequest<PointsResponse>(pointsUrl);

    if (!pointsData) {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to retrieve weather data for ${locationName}, ${locationState}. This location may not be supported by the NWS API (only US locations are supported).`,
          },
        ],
      };
    }

    const forecastUrl = pointsData.properties?.forecast;
    if (!forecastUrl) {
      return {
        content: [
          {
            type: 'text',
            text: 'Failed to get forecast URL from grid point data',
          },
        ],
      };
    }

    const forecastData = await this.makeNWSRequest<ForecastResponse>(forecastUrl);
    if (!forecastData) {
      return {
        content: [
          {
            type: 'text',
            text: 'Failed to retrieve forecast data',
          },
        ],
      };
    }

    const periods = forecastData.properties?.periods || [];
    if (periods.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: 'No forecast periods available',
          },
        ],
      };
    }

    const formattedForecast = periods.map(this.formatForecastPeriod);
    const forecastText = `Weather Forecast for ${locationName}, ${locationState}:\n\n${formattedForecast.join('\n')}`;

    return {
      content: [
        {
          type: 'text',
          text: forecastText,
        },
      ],
    };
  }

  async getCoordinatesByCity(city: string, state?: string) {
    const geocodeQuery = state ? `${city}, ${state}` : city;
    const geocodeUrl = `${GEOCODE_API_BASE}/search?q=${encodeURIComponent(geocodeQuery)}&api_key=${GEOCODE_API_KEY}`;
    
    const geocodeData = await this.makeGeocodeRequest<GeocodeMapsResponse[]>(geocodeUrl);

    if (!geocodeData || geocodeData.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `Could not find coordinates for "${city}"${state ? `, ${state}` : ''}. Please check the city name and try again.`,
          },
        ],
      };
    }

    const location = geocodeData[0];
    const latitude = parseFloat(location.lat);
    const longitude = parseFloat(location.lon);
    const displayName = location.display_name;

    return {
      content: [
        {
          type: 'text',
          text: `Location: ${displayName}\nCoordinates: ${latitude}, ${longitude}`,
        },
      ],
    };
  }
} 