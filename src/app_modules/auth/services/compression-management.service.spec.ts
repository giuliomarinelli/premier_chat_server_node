import { Test, TestingModule } from '@nestjs/testing';
import { CompressionManagementService } from './compression-management.service';

describe('CompressionManagementService', () => {
  let service: CompressionManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompressionManagementService],
    }).compile();

    service = module.get<CompressionManagementService>(CompressionManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
