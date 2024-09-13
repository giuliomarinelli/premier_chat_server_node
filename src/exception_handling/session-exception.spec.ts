import { SessionException } from './session-exception';

describe('SessionException', () => {
  it('should be defined', () => {
    expect(new SessionException()).toBeDefined();
  });
});
