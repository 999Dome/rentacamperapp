import { Test, TestingModule } from '@nestjs/testing';
import { InsultController } from './insult.controller';
import { InsultService } from './insult.service';

describe('InsultController', () => {
  let controller: InsultController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsultController],
      providers: [
        {
          provide: InsultService,
          useValue: {
            getInsult: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<InsultController>(InsultController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
