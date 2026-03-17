/**
 * js/openlibrary-api.js — SHELFBOT Open Library Integration
 *
 * Provides:
 *  • OpenLibraryAPI.fetchMetadata(isbn) — book info from Open Library API
 *  • OpenLibraryAPI.coverUrl(isbn, size) — book cover image URL
 *  • In-memory cache so each ISBN is only fetched once per session
 */

const OpenLibraryAPI = (() => {
  'use strict';

  // ── Cache ────────────────────────────────────────────────────────────────────
  const _cache = new Map();

  // ── Helpers ──────────────────────────────────────────────────────────────────

  /** Normalise an ISBN: strip hyphens and spaces */
  function _clean(isbn) {
    return String(isbn || '').replace(/[-\s]/g, '').trim();
  }

  /**
   * Return the Open Library cover image URL.
   * @param {string} isbn
   * @param {'S'|'M'|'L'} size  — S = small (~55px), M = medium, L = large
   */
  function coverUrl(isbn, size = 'M') {
    const clean = _clean(isbn);
    if (!clean) return null;
    return `https://covers.openlibrary.org/b/isbn/${clean}-${size}.jpg`;
  }

  /**
   * Fetch book metadata from Open Library by ISBN.
   * Returns a normalised object or null if not found / error.
   *
   * @param {string} isbn
   * @returns {Promise<{title,author,year,publisher,subjects,description,coverUrl}|null>}
   */
  async function fetchMetadata(isbn) {
    const clean = _clean(isbn);
    if (!clean) return null;

    // Return cached result
    if (_cache.has(clean)) return _cache.get(clean);

    try {
      const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${clean}&format=json&jscmd=data`;
      const res = await fetch(url, { signal: AbortSignal.timeout?.(8000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const key  = `ISBN:${clean}`;
      const data = json[key];

      if (!data) {
        _cache.set(clean, null);
        return null;
      }

      // Extract authors
      const authors = (data.authors || []).map(a => a.name).join(', ') || 'Unknown Author';

      // Extract year
      const year = data.publish_date
        ? data.publish_date.match(/\d{4}/)?.[0] || ''
        : '';

      // Extract first publisher
      const publisher = (data.publishers || [])[0]?.name || '';

      // Extract subjects (up to 5)
      const subjects = (data.subjects || []).slice(0, 5).map(s => s.name || s).join(', ');

      // Description
      let description = '';
      if (data.notes) {
        description = typeof data.notes === 'string' ? data.notes : data.notes.value || '';
      }

      const result = {
        title:       data.title || 'Unknown Title',
        author:      authors,
        year,
        publisher,
        subjects,
        description,
        coverUrl:    coverUrl(clean, 'L'),
        coverUrlSm:  coverUrl(clean, 'S'),
        openLibUrl:  data.url || `https://openlibrary.org/isbn/${clean}`,
        isbn:        clean,
      };

      _cache.set(clean, result);
      return result;

    } catch (err) {
      console.warn('[OpenLibraryAPI] fetchMetadata failed for', isbn, err.message);
      _cache.set(clean, null);
      return null;
    }
  }

  /**
   * Build an <img> tag with a cover thumbnail.
   * Falls back to a placeholder SVG on error.
   * @param {string} isbn
   * @param {string} [alt='Book cover']
   * @param {'S'|'M'|'L'} [size='S']
   */
  function coverImgHTML(isbn, alt = 'Book cover', size = 'S') {
    const clean = _clean(isbn);
    if (!clean) return _placeholderImgHTML(alt);
    const src = coverUrl(clean, size);
    const placeholder = _placeholderDataUrl();
    return `<img
      src="${src}"
      alt="${_esc(alt)}"
      class="book-cover-thumb"
      loading="lazy"
      onerror="this.onerror=null;this.src='${placeholder}'"
    >`;
  }

  /** Inline SVG placeholder (tiny data URL) */
  function _placeholderDataUrl() {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='36' height='48' viewBox='0 0 36 48'>
      <rect width='36' height='48' rx='3' fill='%23131A2E'/>
      <rect x='4' y='4' width='28' height='40' rx='2' fill='%231e2a45'/>
      <rect x='8' y='10' width='20' height='2' rx='1' fill='%238B5CF6' opacity='.6'/>
      <rect x='8' y='15' width='16' height='1.5' rx='1' fill='%236B7280' opacity='.5'/>
      <rect x='8' y='19' width='18' height='1.5' rx='1' fill='%236B7280' opacity='.4'/>
      <text x='18' y='36' text-anchor='middle' font-size='14' fill='%238B5CF6' opacity='.7'>📖</text>
    </svg>`;
    return `data:image/svg+xml,${svg.replace(/\n\s*/g, '')}`;
  }

  function _placeholderImgHTML(alt) {
    return `<img src="${_placeholderDataUrl()}" alt="${_esc(alt)}" class="book-cover-thumb">`;
  }

  function _esc(s) {
    return String(s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ── Public API ────────────────────────────────────────────────────────────────
  return {
    fetchMetadata,
    coverUrl,
    coverImgHTML,
  };

})();
