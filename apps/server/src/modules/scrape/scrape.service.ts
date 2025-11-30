import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { ScrapeGateway } from '../websocket/scrape.gateway';
import { SCRAPE_TOPICS } from '@card-collection-manager-app/shared';

@Injectable()
export class ScrapeService implements OnModuleInit, OnModuleDestroy {
  private kafka = new Kafka({
    clientId: 'server-api',
    brokers: ['localhost:9092'],
  });
  private consumer = this.kafka.consumer({
    groupId: 'server-scrape-group',
  });

  constructor(private readonly scrapeGateway: ScrapeGateway) {}

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: SCRAPE_TOPICS.SCRAPE_CARDS_FINISHED,
      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (topic === SCRAPE_TOPICS.SCRAPE_CARDS_FINISHED) {
          const payload = JSON.parse(message.value?.toString() || '{}');
          this.scrapeGateway.notifySearchFinished(
            {
              collectionName: payload.collectionName,
              cardSetCode: payload.cardSetCode,
            },
            payload.socketId,
          );
        }
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}