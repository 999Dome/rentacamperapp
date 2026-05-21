import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CamperModule } from './camper/camper.module';
import { InsultModule } from './insult/insult.module';

@Module({
  imports: [CamperModule, InsultModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
