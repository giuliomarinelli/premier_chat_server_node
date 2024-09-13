import { SecureCookieIntegrityViolationException } from './secure-cookie-integrity-violation-exception';

describe('SecureCookieIntegrityViolationException', () => {
  it('should be defined', () => {
    expect(new SecureCookieIntegrityViolationException()).toBeDefined();
  });
});
