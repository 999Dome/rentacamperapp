import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import {
  CamperBlocking,
  CreateCamperBlockingDto,
} from '../../domain/interfaces/camper_blocking.interface';

@Injectable()
export class CamperBlockingRepository {
  private readonly tableName = 'camper_blockings';

  constructor(private readonly supabase: SupabaseService) {}

  async create(dto: CreateCamperBlockingDto): Promise<CamperBlocking> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .insert(dto)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create camper blocking: ${error.message}`);
    }

    return data;
  }

  async findByCamperId(camperId: string): Promise<CamperBlocking[]> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*')
      .eq('camper_id', camperId)
      .order('start_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch camper blockings: ${error.message}`);
    }

    return data;
  }

  async findById(id: string): Promise<CamperBlocking | null> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch camper blocking: ${error.message}`);
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete camper blocking: ${error.message}`);
    }
  }

  async findOverlappingBlockings(
    camperId: string,
    startDate: string,
    endDate: string,
  ): Promise<CamperBlocking[]> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .select('*')
      .eq('camper_id', camperId)
      .lte('start_date', endDate)
      .gte('end_date', startDate);

    if (error) {
      throw new Error(
        `Failed to check overlapping blockings: ${error.message}`,
      );
    }

    return data || [];
  }
}
