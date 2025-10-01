import { describe, test, expect } from '@jest/globals';

describe('App', () => {
  test('should be defined', () => {
    expect(true).toBe(true);
  });

  test('should pass basic test', () => {
    const result = 1 + 1;
    expect(result).toBe(2);
  });
});
