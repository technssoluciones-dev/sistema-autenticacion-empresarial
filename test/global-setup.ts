import 'tsconfig-paths/register';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

export default async () => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error(
      `global-setup abortado: NODE_ENV es "${process.env.NODE_ENV}", se esperaba "test".`,
    );
  }

  if (!process.env.DB_NAME?.includes('test')) {
    throw new Error(
      `global-setup abortado: DB_NAME ("${process.env.DB_NAME}") no contiene "test".`,
    );
  }

  console.log('✅ Entorno de test validado.');
};