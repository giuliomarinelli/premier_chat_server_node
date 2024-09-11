import { CompressionException } from './compression-exception';

describe('CompressionException', () => {
  it('should be defined', () => {
    expect(new CompressionException()).toBeDefined();
  });
});
