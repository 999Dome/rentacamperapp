import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export class UpdateProfileDto {
  first_name?: string;
  last_name?: string;
  drivers_license_class?: string | null;
}

@Injectable()
export class ProfilesService {
  readonly table = 'profiles';

  constructor(private readonly supabase: SupabaseService) {}

  async findOne(id: string) {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, dto: UpdateProfileDto) {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .update({
        first_name: dto.first_name,
        last_name: dto.last_name,
        drivers_license_class: dto.drivers_license_class,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
