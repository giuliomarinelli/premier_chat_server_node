import { Test, TestingModule } from '@nestjs/testing';
import { SecurityUtils } from './security-utils';

describe('SecurityUtilsService', () => {
  let service: SecurityUtils;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityUtils],
    }).compile();

    service = module.get<SecurityUtils>(SecurityUtils);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
