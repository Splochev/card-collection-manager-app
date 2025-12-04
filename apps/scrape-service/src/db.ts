import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';
import { CardEntity } from './entities/card.entity';
import { CardEditions } from './entities/card-editions.entity';

const isBuilt = __dirname.includes('dist');
const envPath = isBuilt
  ? join(__dirname, '..', '..', '..', '..', '.env')
  : join(__dirname, '..', '.env');

config({ path: envPath });

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
