import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Database } from '../../types/supabase';
import { EntityNotFoundException } from '../../domain/exceptions/domain.exception';

/** A driver's-license row, generated from the Supabase schema. */
export type DriversLicenseRow =
  Database['public']['Tables']['drivers_license']['Row'];

/**
 * Abstraction over driver's-license persistence. Injected via
 * {@link DRIVERS_LICENSE_REPOSITORY_TOKEN}.
 */
export interface IDriversLicenseRepository {
  findById(id: string): Promise<DriversLicenseRow>;
  findAll(): Promise<DriversLicenseRow[]>;
}

/** Supabase-backed implementation of {@link IDriversLicenseRepository}. */
@Injectable()
export class DriversLicenseRepository implements IDriversLicenseRepository {
  private readonly tableName = 'drivers_license';

  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Fetches a license by id.
   *
   * @param id The license id.
   * @returns The license row.
   * @throws EntityNotFoundException If no license exists for the id.
   * @throws Error If the query itself fails.
   */
  async findById(id: string): Promise<DriversLicenseRow> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch drivers license: ${error.message}`);
    }

    if (!data) {
      throw new EntityNotFoundException('DriversLicense', id);
    }

    return data;
  }

  /**
   * @returns All driver's-license records (e.g. for a class dropdown).
   * @throws Error If the query fails.
   */
  async findAll(): Promise<DriversLicenseRow[]> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*');

    if (error) {
      throw new Error(`Failed to fetch drivers licenses: ${error.message}`);
    }

    return data || [];
  }
}

/** DI token used to inject {@link IDriversLicenseRepository} implementations. */
export const DRIVERS_LICENSE_REPOSITORY_TOKEN = 'IDriversLicenseRepository';
