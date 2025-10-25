import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    this.client = new Redis({
      host,
      port,
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
    });

    this.client.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    this.client.on('connect', () => {
      console.log('Redis client connected');
    });
  }

  async set(key: string, value: any, ttlInSeconds?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);

    if (ttlInSeconds) {
      await this.client.set(key, serializedValue, 'EX', ttlInSeconds);
    } else {
      await this.client.set(key, serializedValue);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);

    if (!value) {
      return null;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      return JSON.parse(value as string) as T;
    } catch (error) {
      console.error(`Error parsing Redis value for key ${key}:`, error);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async keys(pattern: string): Promise<string[]> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return (await this.client.keys(pattern)) as string[];
  }

  async flushAll(): Promise<void> {
    await this.client.flushall();
  }

  getClient(): Redis {
    return this.client;
  }
}
