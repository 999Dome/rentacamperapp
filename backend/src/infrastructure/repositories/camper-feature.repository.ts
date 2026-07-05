import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

/**
 * Abstraction over camper-feature persistence.
 *
 * The return type is `unknown[]` on purpose: rows are a join
 * (`camper_features` × `features`) whose exact shape is decided by the query,
 * and callers currently forward it straight to the client. `unknown` (not
 * `any`) keeps the value type-safe — consumers must narrow it before use.
 */
export interface ICamperFeatureRepository {
  findByCamperId(camperId: string): Promise<unknown[]>;
}

/** Supabase-backed implementation of {@link ICamperFeatureRepository}. */
@Injectable()
export class CamperFeatureRepository implements ICamperFeatureRepository {
  private readonly tableName = 'camper_features';

  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Fetches a camper's features, joining in the referenced `features` rows so
   * each result carries the full feature detail, not just the link row.
   *
   * @param camperId The camper whose features to load.
   * @returns The joined camper-feature rows; empty if none.
   * @throws Error If the query fails.
   */
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

/** DI token used to inject {@link ICamperFeatureRepository} implementations. */
export const CAMPER_FEATURE_REPOSITORY_TOKEN = 'ICamperFeatureRepository';
