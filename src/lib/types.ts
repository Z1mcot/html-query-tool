export type QueryMode = 'css' | 'xpath';

export interface QueryMatch {
  /** index within the matches array */
  index: number;
  tagName: string;
  /** short human-readable attribute summary, e.g. #id.class */
  summary: string;
  /** 1-based line number in the raw source, if it could be located */
  line: number | null;
  /** 1-based column number in the raw source, if it could be located */
  column: number | null;
}

export interface QueryResult {
  matches: QueryMatch[];
  /** error message for a malformed selector/xpath expression */
  error: string | null;
}
