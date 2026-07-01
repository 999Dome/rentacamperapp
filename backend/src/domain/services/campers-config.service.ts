import { Injectable } from '@nestjs/common';

@Injectable()
export class CampersConfigService {
  /**
   * IDs of campers highlighted on the homepage.
   * These are manually curated by the admin.
   */
  getHighlightCamperIds(): string[] {
    return [
      'be1d4ae1-e9bc-43b0-9a04-1d8c6dfec1a9',
      'a7c5978a-63c0-40f8-aecf-2a55ec670785',
      '33af45c5-0c50-4a20-b568-c14eed439614',
    ];
  }
}
