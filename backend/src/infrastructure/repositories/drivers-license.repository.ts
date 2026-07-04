import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Database } from '../../types/supabase';
import { EntityNotFoundException } from '../../domain/exceptions/domain.exception';

export type DriversLicenseRow =
  Database['public']['Tables']['drivers_license']['Row'];

export interface IDriversLicenseRepository {
  findById(id: string): Promise<DriversLicenseRow>;
  findAll(): Promise<DriversLicenseRow[]>;
}

@Injectable()
export class DriversLicenseRepository implements IDriversLicenseRepository {
  private readonly tableName = 'drivers_license';

  constructor(private readonly supabase: SupabaseService) {}

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

export const DRIVERS_LICENSE_REPOSITORY_TOKEN = 'IDriversLicenseRepository';
