import { Module } from '@nestjs/common';
import { CampersController } from './campers.controller';
import { CampersService } from './camper.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [CampersController],
  providers: [CampersService],
})
export class CampersModule {}
