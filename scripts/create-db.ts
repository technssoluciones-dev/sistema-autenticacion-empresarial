import 'tsconfig-paths/register';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

const env = process.env.NODE_ENV || 'development';
const envFile = env === 'development' ? '.env' : `.env.${env}`;

dotenv.config({ path: path.resolve(__dirname, '..', envFile) });

const createDatabase = async () => {
  const dbName = process.env.DB_NAME;

  if (!dbName) {
    throw new Error('DB_NAME no está definida en las variables de entorno.');
  }

  const adminDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
    synchronize: false,
    logging: false,
  });

  await adminDataSource.initialize();

  const result = await adminDataSource.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [dbName],
  );

  if (result.length === 0) {
    await adminDataSource.query(`CREATE DATABASE "${dbName}"`);
    console.log(`✅ Base de datos "${dbName}" creada exitosamente.`);
  } else {
    console.log(`ℹ️ La base de datos "${dbName}" ya existe.`);
  }

  await adminDataSource.destroy();
};

createDatabase().catch((err) => {
  console.error('❌ Error creando la base de datos:', err);
  process.exit(1);
});