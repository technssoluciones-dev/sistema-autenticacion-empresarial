import 'tsconfig-paths/register';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

const env = process.env.NODE_ENV || 'development';
const envFile = env === 'development' ? '.env' : `.env.${env}`;

dotenv.config({ path: path.resolve(__dirname, `../../${envFile}`) });

const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'];
const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `❌ Variables de entorno faltantes tras cargar ${envFile}: ${missing.join(', ')}`,
  );
}

const rootDir = path.resolve(__dirname, '..', '..');

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [path.join(rootDir, 'src', '**', '*.entity.ts')],
  migrations: [path.join(rootDir, 'src', 'database', 'migrations', '*.ts')],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
});
