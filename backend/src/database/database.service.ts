import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Pool, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService
  implements OnModuleInit, OnModuleDestroy
{
  private pool!: Pool;

  onModuleInit(): void {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'taskboard_db',
    });
  }

  async query<R extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<R>> {
    return this.pool.query<R>(text, params);
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}