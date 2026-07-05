import { Injectable } from '@nestjs/common';

/**
 * Central place for static, non-persisted camper configuration.
 *
 * Right now this only holds the curated list of "highlight" campers shown on
 * the homepage. Keeping it in a dedicated service (instead of hard-coding the
 * ids in a controller/service) means the source of these values is obvious and
 * easy to swap for a DB/config lookup later.
 */
@Injectable()
export class CampersConfigService {
  /**
   * IDs of campers highlighted on the homepage. Manually curated by the admin.
   *
   * @returns The list of camper ids to feature, in display order.
   */
  getHighlightCamperIds(): string[] {
    return [
      'be1d4ae1-e9bc-43b0-9a04-1d8c6dfec1a9',
      'a7c5978a-63c0-40f8-aecf-2a55ec670785',
      '33af45c5-0c50-4a20-b568-c14eed439614',
    ];
  }
}
