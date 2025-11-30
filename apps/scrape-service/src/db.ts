import { DataSource } from 'typeorm';
import { CardEntity } from './entities/card.entity';
import { CardEditions } from './entities/card-editions.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'card_collection',
  entities: [CardEntity, CardEditions],
  synchronize: false,
});
