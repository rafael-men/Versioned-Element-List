import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../../../domain/entities/user';
import { ElementList } from '../../../domain/entities/element-list';
import { ListVersion } from '../../../domain/entities/list-version';

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USER ?? 'app',
  password: process.env.DB_PASSWORD ?? 'app',
  database: process.env.DB_NAME ?? 'lista_versionada',
  entities: [User, ElementList, ListVersion],
  synchronize: true,
};

export const AppDataSource = new DataSource(dataSourceOptions);
