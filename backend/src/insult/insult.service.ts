import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InsultResponse } from '../../../shared/insult';

@Injectable()
export class InsultService {
  constructor(private readonly httpService: HttpService) {}

  async getInsult(): Promise<InsultResponse> {
    const url = `https://evilinsult.com/generate_insult.php?lang=de&type=json&_=${Date.now()}`;
    const { data } = await firstValueFrom(
      this.httpService.get<InsultResponse>(url),
    );
    return data;
  }
}
