import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../../../domain/entities/user';
import { ElementList } from '../../../domain/entities/element-list';
import { ListVersion } from '../../../domain/entities/list-version';

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória não definida: ${name}`);
  }
  return value;
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: requiredEnv('DB_USER'),
  password: requiredEnv('DB_PASSWORD'),
  database: process.env.DB_NAME ?? 'lista_versionada',
  entities: [User, ElementList, ListVersion],
  synchronize: true,
};

export const AppDataSource = new DataSource(dataSourceOptions);
