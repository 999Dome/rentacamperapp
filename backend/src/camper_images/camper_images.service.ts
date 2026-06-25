import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class CamperImagesService {
  readonly highlight_camper_ids = [
    'be1d4ae1-e9bc-43b0-9a04-1d8c6dfec1a9',
    'a7c5978a-63c0-40f8-aecf-2a55ec670785',
    '33af45c5-0c50-4a20-b568-c14eed439614',
  ];
  readonly table = 'camper_images';

  constructor(private readonly supabase: SupabaseService) {}

  async findHighlights() {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('camper_id, image_path')
      .in('camper_id', this.highlight_camper_ids)
      .eq('is_primary', true);

    if (error) throw new Error(error.message);
    return data;
  }

  async findPrimaryByCamperId(camperId: string) {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('*')
      .eq('camper_id', camperId)
      .eq('is_primary', true)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async findAllByCamperId(camperId: string) {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('*')
      .eq('camper_id', camperId);

    if (error) throw new Error(error.message);
    return data;
  }
}
