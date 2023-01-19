import path from 'path';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export let db: DataSource;

export const initializeDb = async () => {
  db = new DataSource({
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    type: 'postgres',
    entities: [path.resolve(__dirname, 'entities/*.[t|j]s')],
    synchronize: true,
    dropSchema: !!process.env.SEED_DATABASE,
    namingStrategy: new SnakeNamingStrategy(),
  });
  await db.initialize();
};
