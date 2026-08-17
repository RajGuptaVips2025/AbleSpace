import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

interface DatabaseTimeRow {
  now: Date;
}

@Injectable()
export class AppService {
  constructor(private readonly db: DatabaseService) {}

  async getHello() {
    const result = await this.db.query<DatabaseTimeRow>('SELECT NOW() AS now');

    return {
      status: 'Database connected!',
      time: result.rows[0].now,
    };
  }
}