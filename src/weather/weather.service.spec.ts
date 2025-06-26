import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';

describe('WeatherService', () => {
  let service: WeatherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeatherService],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getForecastByCity', () => {
    it('should return weather forecast for a valid US city', async () => {
      const result = await service.getForecastByCity('New York', 'NY');
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
    });

    it('should handle city without state', async () => {
      const result = await service.getForecastByCity('Los Angeles');
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should handle international city', async () => {
      const result = await service.getForecastByCity('London');
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('Location found');
    });

    it('should handle invalid city', async () => {
      const result = await service.getForecastByCity('InvalidCity123');
      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('Could not find location');
    });
  });

  describe('getCoordinatesByCity', () => {
    it('should return coordinates for a valid city', async () => {
      const result = await service.getCoordinatesByCity('New York');
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Coordinates:');
    });

    it('should handle international city', async () => {
      const result = await service.getCoordinatesByCity('London');
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('Coordinates:');
    });

    it('should handle city with state', async () => {
      const result = await service.getCoordinatesByCity('Los Angeles', 'CA');
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should handle invalid city', async () => {
      const result = await service.getCoordinatesByCity('InvalidCity123');
      expect(result).toBeDefined();
      expect(result.content[0].text).toContain('Could not find coordinates');
    });
  });

  describe('getAlerts', () => {
    it('should return alerts for a valid state', async () => {
      const result = await service.getAlerts('CA');
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
    });
  });

  describe('getForecast', () => {
    it('should return forecast for valid coordinates', async () => {
      const result = await service.getForecast(40.7128, -74.0060);
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
    });
  });
}); 