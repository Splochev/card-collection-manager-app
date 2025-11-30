/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { scrapeCards, migrateMarketURLs } from './services/scrapeService';
import { AppDataSource } from './db';
import { Kafka } from 'kafkajs';
import {
  MICROSERVICES_GROUPS,
  SCRAPE_TOPICS,
} from '@card-collection-manager-app/shared';

async function initDb() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log('DB initialized');
  }
}

const kafka = new Kafka({
  clientId: 'scrape-service',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({
  groupId: MICROSERVICES_GROUPS.SCRAPE_GROUP,
});

async function handleScrapeCards(payload: any) {
  await scrapeCards(payload.cardSetNames);
  await producer.send({
    topic: SCRAPE_TOPICS.SCRAPE_CARDS_FINISHED,
    messages: [
      {
        value: JSON.stringify({
          socketId: payload.socketId,
          cardSetCode: payload.cardSetCode,
          collectionName: payload.cardSetNames[0],
        }),
      },
    ],
  });
  await migrateMarketURLs();
}

async function handleMigrateMarketURLs() {
  await migrateMarketURLs();
}

const producer = kafka.producer();

async function run() {
  await initDb();
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({
    topic: SCRAPE_TOPICS.SCRAPE_CARDS,
    fromBeginning: false,
  });
  await consumer.subscribe({
    topic: SCRAPE_TOPICS.MIGRATE_MARKET_URLS,
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const payload = JSON.parse(message.value?.toString() || '{}');
      if (topic === SCRAPE_TOPICS.SCRAPE_CARDS) {
        await handleScrapeCards(payload);
      } else if (topic === SCRAPE_TOPICS.MIGRATE_MARKET_URLS) {
        await handleMigrateMarketURLs();
      }
    },
  });
}

run().catch(console.error);
