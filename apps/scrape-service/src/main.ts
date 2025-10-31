import { Kafka } from 'kafkajs';
import {
  MICROSERVICES_GROUPS,
  SCRAPE_TOPICS,
} from '@card-collection-manager-app/shared';

const kafka = new Kafka({
  clientId: 'scrape-service',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({
  groupId: MICROSERVICES_GROUPS.SCRAPE_GROUP,
});

async function run() {
  await consumer.connect();
  await consumer.subscribe({
    topic: SCRAPE_TOPICS.SCRAPE,
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log('Hello World');
      // Optionally print message value:
      // console.log({ value: message.value?.toString() });
    },
  });
}

run().catch(console.error);
