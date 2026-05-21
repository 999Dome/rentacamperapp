import { Test, TestingModule } from '@nestjs/testing';
import { CamperService } from './camper.service';

describe('CamperService', () => {
  let service: CamperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CamperService],
    }).compile();

    service = module.get<CamperService>(CamperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
