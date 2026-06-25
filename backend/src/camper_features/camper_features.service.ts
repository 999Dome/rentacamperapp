import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class CamperFeaturesService {
  readonly table = 'camper_features';

  constructor(private readonly supabase: SupabaseService) {}

  async findByCamperId(camperId: string) {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('*, features(*)')
      .eq('camper_id', camperId);

    if (error) throw new Error(error.message);
    return data;
  }
}
