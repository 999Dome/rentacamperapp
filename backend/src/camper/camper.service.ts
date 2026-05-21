import { Injectable } from '@nestjs/common';

@Injectable()
export class CamperService {
  private readonly campers = [
    { id: 1, name: 'Adventure Van', brand: 'VW', price: 89 },
    { id: 2, name: 'Luxury Liner', brand: 'Mercedes', price: 145 },
  ];
  findAll() {
    return this.campers;
  }
}
