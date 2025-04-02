export interface Weather {
  id?: string;
  city: string;
  country: string;
  temperature: number;
  humidity: number;
  conditions: string;
  icon: string;
  feelsLike?: number;
  tempMin?: number;
  tempMax?: number;
} 