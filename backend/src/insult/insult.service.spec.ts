import { Test, TestingModule } from '@nestjs/testing';
import { InsultService } from './insult.service';
import { HttpModule } from '@nestjs/axios';

describe('InsultService', () => {
  let service: InsultService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [InsultService],
    }).compile();

    service = module.get<InsultService>(InsultService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
