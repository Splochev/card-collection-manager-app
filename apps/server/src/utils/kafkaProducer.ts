import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'server-api',
  brokers: ['localhost:9092'],
});

export const kafkaProducer = kafka.producer();

export async function sendKafkaMessage(topic: string, message: any) {
  await kafkaProducer.connect();
  await kafkaProducer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
  await kafkaProducer.disconnect();
}
