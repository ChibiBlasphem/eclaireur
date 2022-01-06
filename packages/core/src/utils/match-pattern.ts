import nodePath from 'node:path';
import GlobToRegExp from 'glob-to-regexp';
import type { FilepathPattern } from '../types/core';

export function createPatternToRegexp(root: string) {
  return function (pattern: FilepathPattern) {
    return typeof pattern === 'string'
      ? GlobToRegExp(nodePath.resolve(root, pattern), { extended: true, globstar: true })
      : pattern;
  };
}

export function matchPattern(path: string, regexpes: RegExp[]): boolean {
  return regexpes.some((regexp) => regexp.test(path));
}

export function matchPatternInHashmap(path: string, regexpHashmap: Record<string, RegExp>): string | null {
  for (const [patternPath, regexp] of Object.entries(regexpHashmap)) {
    if (regexp.test(path)) {
      return patternPath;
    }
  }
  return null;
}
