import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import {
  CamperBlocking,
  CreateCamperBlockingDto,
} from '../../domain/interfaces/camper_blocking.interface';

/**
 * Data-access layer for the `camper_blockings` table — the provider-managed
 * availability blocks used alongside bookings to decide whether a camper is
 * free for a requested period.
 */
@Injectable()
export class CamperBlockingRepository {
  private readonly tableName = 'camper_blockings';

  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Creates a new availability block for a camper.
   *
   * @param dto Camper id and the date range to block (reason is not persisted).
   * @returns The created blocking row.
   * @throws Error If the insert fails.
   */
  async create(dto: CreateCamperBlockingDto): Promise<CamperBlocking> {
    const { data, error } = await this.supabase.client
      .from(this.tableName)
      .insert({
        camper_id: dto.camper_id,
        start_date: dto.start_date,
        end_date: dto.end_date,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create camper blocking: ${error.message}`);
    }

    return data;
  }

  /**
   * Lists all blockings for a camper, earliest first.
   *
   * @param camperId The camper to list blockings for.
   * @returns The camper's blockings ordered by start date.
   * @throws Error If the query fails.
   */
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

  /**
   * Fetches a single blocking by id.
   *
   * @param id The blocking id.
   * @returns The blocking, or `null` if none exists.
   * @throws Error If the query fails.
   */
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

  /**
   * Deletes a blocking by id.
   *
   * @param id The blocking id to delete.
   * @throws Error If the delete fails.
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete camper blocking: ${error.message}`);
    }
  }

  /**
   * Finds blockings that overlap a requested date range for a camper.
   *
   * Two ranges overlap when the existing block starts on/before the requested
   * end AND ends on/after the requested start — hence the `lte`/`gte` pair.
   *
   * @param camperId  The camper to check.
   * @param startDate Requested range start (ISO `YYYY-MM-DD`).
   * @param endDate   Requested range end (ISO `YYYY-MM-DD`).
   * @returns Overlapping blockings; empty if the range is free.
   * @throws Error If the query fails.
   */
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
