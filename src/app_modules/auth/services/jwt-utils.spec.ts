import { Test, TestingModule } from '@nestjs/testing';
import { JwtUtils } from './jwt-utils';

describe('JwtUtilsService', () => {
  let service: JwtUtils;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtUtils],
    }).compile();

    service = module.get<JwtUtils>(JwtUtils);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
