import type { QueryMatch, QueryMode, QueryResult } from './types';

/**
 * Parses raw HTML into a Document, surfacing DOMParser's <parsererror>
 * as a friendly error instead of a silently broken document.
 */
export function parseHtml(raw: string): { doc: Document; parseError: string | null } {
  const doc = new DOMParser().parseFromString(raw, 'text/html');
  const errorNode = doc.querySelector('parsererror');
  return {
    doc,
    parseError: errorNode ? errorNode.textContent ?? 'Failed to parse HTML.' : null,
  };
}

/** Opening-tag scanner used to map DOM elements back to raw source offsets. */
const OPEN_TAG_RE = /<([a-zA-Z][a-zA-Z0-9-]*)(?:\s[^<>]*)?\/?>/g;

interface TagOffset {
  tagName: string;
  offset: number;
}

function scanOpenTagOffsets(raw: string): TagOffset[] {
  const offsets: TagOffset[] = [];
  OPEN_TAG_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = OPEN_TAG_RE.exec(raw)) !== null) {
    offsets.push({ tagName: m[1].toLowerCase(), offset: m.index });
  }
  return offsets;
}

function offsetToLineColumn(raw: string, offset: number): { line: number; column: number } {
  let line = 1;
  let lastNewline = -1;
  for (let i = 0; i < offset; i++) {
    if (raw.charCodeAt(i) === 10) {
      line++;
      lastNewline = i;
    }
  }
  return { line, column: offset - lastNewline };
}

function summarize(el: Element): string {
  const id = el.id ? `#${el.id}` : '';
  const cls = el.classList.length ? `.${Array.from(el.classList).join('.')}` : '';
  return `${el.tagName.toLowerCase()}${id}${cls}`;
}

/**
 * Builds a lookup from Element (in document order) to its raw-source
 * line/column, by walking the document tree and the raw text's opening
 * tags in parallel. This is best-effort: parsers can normalize malformed
 * markup (implied <tbody>, auto-closed tags, etc.), so a mismatch simply
 * means some matches won't get a precise location.
 */
function buildPositionIndex(doc: Document, raw: string): Map<Element, { line: number; column: number }> {
  const allElements = Array.from(doc.querySelectorAll('*'));
  const tagOffsets = scanOpenTagOffsets(raw);
  const index = new Map<Element, { line: number; column: number }>();

  let rawIdx = 0;
  for (const el of allElements) {
    const tagName = el.tagName.toLowerCase();
    // advance through raw tag list to find the next tag with a matching name
    while (rawIdx < tagOffsets.length && tagOffsets[rawIdx].tagName !== tagName) {
      rawIdx++;
    }
    if (rawIdx >= tagOffsets.length) break;
    index.set(el, offsetToLineColumn(raw, tagOffsets[rawIdx].offset));
    rawIdx++;
  }
  return index;
}

export function runQuery(raw: string, mode: QueryMode, query: string): QueryResult {
  if (!query.trim()) {
    return { matches: [], error: null };
  }

  const { doc, parseError } = parseHtml(raw);
  if (parseError) {
    return { matches: [], error: parseError };
  }

  let elements: Element[] = [];
  try {
    if (mode === 'css') {
      elements = Array.from(doc.querySelectorAll(query));
    } else {
      const result = document.evaluate(
        query,
        doc,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null,
      );
      for (let i = 0; i < result.snapshotLength; i++) {
        const node = result.snapshotItem(i);
        if (node && node.nodeType === Node.ELEMENT_NODE) {
          elements.push(node as Element);
        }
      }
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { matches: [], error: `Invalid ${mode === 'css' ? 'CSS selector' : 'XPath expression'}: ${message}` };
  }

  const positionIndex = buildPositionIndex(doc, raw);

  const matches: QueryMatch[] = elements.map((el, i) => {
    const pos = positionIndex.get(el);
    return {
      index: i,
      tagName: el.tagName.toLowerCase(),
      summary: summarize(el),
      line: pos?.line ?? null,
      column: pos?.column ?? null,
    };
  });

  return { matches, error: null };
}
