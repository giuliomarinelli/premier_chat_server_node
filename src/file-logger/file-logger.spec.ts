import { HttpExceptionLogger } from './http-exception-logger';

describe('FileLogger', () => {
  it('should be defined', () => {
    expect(HttpExceptionLogger.getLogger()).toBeDefined();
  });
});
