import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { CampersModule } from './campers/camper.module';
import { CamperImagesModule } from './camper_images/camper_images.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    SupabaseModule,
    CampersModule,
    CamperImagesModule,
  ],
})
export class AppModule {}
