import { Test, TestingModule } from '@nestjs/testing';
import { CamperController } from './camper.controller';
import { CamperService } from './camper.service';

describe('CamperController', () => {
  let controller: CamperController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CamperController],
      providers: [
        {
          provide: CamperService,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CamperController>(CamperController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
