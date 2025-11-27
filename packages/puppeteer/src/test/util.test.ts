import { describe, it, expect } from 'vitest';
import { isNumber, getArray, toInteger } from '../util';

describe('util.ts', () => {
  describe('isNumber', () => {
    it('should return true for valid numbers', () => {
      expect(isNumber(42)).toBe(true);
      expect(isNumber(0)).toBe(true);
      expect(isNumber(-1)).toBe(true);
      expect(isNumber(3.14)).toBe(true);
    });

    it('should return false for NaN', () => {
      expect(isNumber(NaN)).toBe(false);
    });

    it('should return false for non-number types', () => {
      expect(isNumber('42')).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
      expect(isNumber({})).toBe(false);
      expect(isNumber([])).toBe(false);
      expect(isNumber(() => {})).toBe(false);
    });
  });

  describe('getArray', () => {
    it('should return an empty array when input is null or undefined', () => {
      expect(getArray(null)).toEqual([]);
      expect(getArray(undefined)).toEqual([]);
    });

    it('should return an array of strings when input is an array', () => {
      expect(getArray(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
      expect(getArray(['a', 1, 'c'])).toEqual(['a', 'c']);
      expect(getArray([1, 2, 3])).toEqual([]);
    });

    it('should return a single-element array when input is a string', () => {
      expect(getArray('hello')).toEqual(['hello']);
    });

    it('should return an empty array when input is a non-string, non-array type', () => {
      expect(getArray(42)).toEqual([]);
      expect(getArray({})).toEqual([]);
      expect(getArray(() => {})).toEqual([]);
    });
  });

  describe('toInteger', () => {
    it('should round valid numbers to integers', () => {
      expect(toInteger(3.14, 0)).toBe(3);
      expect(toInteger(3.5, 0)).toBe(4);
      expect(toInteger(-3.14, 0)).toBe(-3);
      expect(toInteger(-3.5, 0)).toBe(-3);
      expect(toInteger(0, 42)).toBe(0);
    });

    it('should return default value when input is NaN', () => {
      expect(toInteger(NaN, 42)).toBe(42);
    });

    it('should return default value when input is not a number', () => {
      expect(toInteger('42', 42)).toBe(42);
      expect(toInteger(null, 42)).toBe(42);
      expect(toInteger(undefined, 42)).toBe(42);
      expect(toInteger({}, 42)).toBe(42);
      expect(toInteger([], 42)).toBe(42);
    });

    it('should round default value to integer', () => {
      expect(toInteger('not a number', 3.14)).toBe(3);
    });
  });
});