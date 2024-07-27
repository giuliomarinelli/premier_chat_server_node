import { Test, TestingModule } from '@nestjs/testing';
import { SecurityUtilsService } from './security-utils.service';

describe('SecurityUtilsService', () => {
  let service: SecurityUtilsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityUtilsService],
    }).compile();

    service = module.get<SecurityUtilsService>(SecurityUtilsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
