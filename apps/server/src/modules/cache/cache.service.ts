import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CacheService {
  constructor(private readonly redisService: RedisService) {}

  async get<T>(key: string): Promise<T | null> {
    return this.redisService.get<T>(key);
  }

  async set(key: string, value: any, ttlInSeconds = 300): Promise<void> {
    await this.redisService.set(key, value, ttlInSeconds);
  }

  async del(key: string): Promise<void> {
    await this.redisService.del(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.redisService.keys(pattern);
  }
}
