/**
 * Type definitions for nested-regex-groups
 * 
 * These types can be imported in JavaScript files using JSDoc:
 * @example
 * // In JavaScript:
 * /** @type {import('nested-regex-groups').ParseResult} *\/
 * const result = parser('input');
 */

/**
 * Result of a successful parse operation
 */
export interface ParseSuccess<T = any> {
  success: true;
  value: T;
  matched: string;
  rest: string;
}

/**
 * Result of a failed parse operation
 */
export interface ParseFailure {
  success: false;
  error: string;
  position?: number;
}

/**
 * Union type for parse results
 */
export type ParseResult<T = any> = ParseSuccess<T> | ParseFailure;

/**
 * A pattern definition with metadata (internal use with compiled RegExp)
 */
export interface ParsePattern {
  name: string;
  regex: RegExp;
  description?: string;
  /**
   * Optional mapping from regex group names to dot-notation paths
   * Example: { user_name: 'user.name', user_domain: 'user.domain' }
   */
  groupMap?: Record<string, string>;
}

/**
 * Pattern configuration for parsePatterns and parsePattern functions
 * Used when loading patterns from JSON or defining patterns as strings
 */
export interface PatternConfig {
  name: string;
  pattern: string;
  description?: string;
  /**
   * Default values to merge into the parsed result
   * Keys can use dot notation for nested values
   * Example: { trigger: 'on', 'lhs.id': '#lhs' }
   */
  defaultVals?: Record<string, string>;
}

/**
 * Options for nestedRegex function
 */
export interface NestedRegexOptions {
  /**
   * Optional name for the pattern (used in error messages)
   */
  name?: string;
  /**
   * Optional mapping from regex group names to dot-notation paths
   * Example: { user_name: 'user.name', user_domain: 'user.domain' }
   */
  groupMap?: Record<string, string>;
}

/**
 * Options for creating a parser
 */
export interface ParserOptions {
  /**
   * If true, returns detailed error information when no pattern matches
   */
  verbose?: boolean;

  /**
   * When true, periods inside matched pairs of { } are not treated
   * as statement delimiters during splitting.
   */
  ignorePeriodInsideBraces?: boolean;
}

/**
 * Result type for parsing multiple statements
 */
export interface StatementsResult<T = any> {
  success: boolean;
  statements: Array<{
    pattern?: string;
    value?: T;
    error?: string;
    matched?: string;
  }>;
}
