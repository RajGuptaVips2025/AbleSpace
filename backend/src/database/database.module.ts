import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Global() // Makes DatabaseService accessible everywhere without re-importing
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}