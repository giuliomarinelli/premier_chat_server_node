import { Test, TestingModule } from '@nestjs/testing';
import { Argon2PasswordEncoderService } from './argon2-password-encoder';

describe('Argon2PasswordEncoderService', () => {
  let service: Argon2PasswordEncoderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Argon2PasswordEncoderService],
    }).compile();

    service = module.get<Argon2PasswordEncoderService>(Argon2PasswordEncoderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
