import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

export interface ICamperFeatureRepository {
  findByCamperId(camperId: string): Promise<unknown[]>;
}

@Injectable()
export class CamperFeatureRepository implements ICamperFeatureRepository {
  private readonly tableName = 'camper_features';

  constructor(private readonly supabase: SupabaseService) {}

  async findByCamperId(camperId: string): Promise<unknown[]> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*, features(*)')
      .eq('camper_id', camperId);

    if (error) {
      throw new Error(
        `Failed to fetch camper features for camper ${camperId}: ${error.message}`,
      );
    }

    return data || [];
  }
}

export const CAMPER_FEATURE_REPOSITORY_TOKEN = 'ICamperFeatureRepository';
