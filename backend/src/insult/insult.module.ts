import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { InsultService } from './insult.service';
import { InsultController } from './insult.controller';

@Module({
  imports: [HttpModule],
  controllers: [InsultController],
  providers: [InsultService],
})
export class InsultModule {}
