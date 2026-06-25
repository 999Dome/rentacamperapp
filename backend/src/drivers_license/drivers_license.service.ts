import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class DriversLicenseService {
  readonly table = 'drivers_license';

  constructor(private readonly supabase: SupabaseService) {}

  async findLicenseById(driversLicenseId: string) {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('*')
      .eq('id', driversLicenseId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
