import { NoSuchElementException } from './no-such-element-exception';

describe('NoSuchElementException', () => {
  it('should be defined', () => {
    expect(new NoSuchElementException()).toBeDefined();
  });
});
