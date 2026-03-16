/**
 * js/library.js — BPUT Library Module  (Professional Redesign)
 *
 * Uses the existing SHELFBOT design-system CSS variables:
 *   --bg-card, --bg-panel, --bg-glass, --border,
 *   --text-primary, --text-secondary, --text-muted,
 *   --accent-primary / --accent-mint / --accent-coral / --accent-amber
 *
 * – All colours come from CSS variables → dark & light theme just work.
 * – A ☀️/🌙 toggle inside the panel header flips data-theme on <html>.
 * – Inline styles are kept to a minimum; real classes in <style#lib-css>.
 */

const LibraryModule = (() => {

  /* ── State ─────────────────────────────────────────────────────────────── */
  let allBooks     = [];
  let filtered     = [];
  let branch       = '';
  let subject      = '';
  let yearFilter   = 0;
  let avail        = 'all';
  let query        = '';
  let sortField    = null;
  let sortDir      = 'asc';
  let page         = 1;
  let perPage      = 10;

  /* ── Branch meta ────────────────────────────────────────────────────────── */
  const BRANCH_INFO = {
    CSE:        { icon: '💻', label: 'CS Eng.' },
    ECE:        { icon: '📡', label: 'ECE' },
    EE:         { icon: '⚡', label: 'Elec. Eng.' },
    Civil:      { icon: '🏗️', label: 'Civil' },
    Mechanical: { icon: '⚙️', label: 'Mech.' },
  };

  /* ── CSS (injected once) ────────────────────────────────────────────────── */
  function _injectCSS() {
    if (document.getElementById('lib-css')) return;
    const el = document.createElement('style');
    el.id = 'lib-css';
    el.textContent = `

/* ══ Library Panel Wrapper ══════════════════════════════════════════════════ */
#panel-library { font-family: 'Inter', sans-serif; }

/* ── Panel header row ─────────────────────────────────────────────────────── */
.lib-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.lib-header-row h2 {
  font-family: 'Outfit', sans-serif;
  font-size: 1.65rem;
  font-weight: 800;
  letter-spacing: -.03em;
  color: var(--text-primary);
  margin-bottom: 4px;
}
.lib-header-row p {
  font-size: .82rem;
  color: var(--text-secondary);
}

/* Theme toggle */
.lib-theme-btn {
  width: 40px; height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--bg-glass);
  font-size: 1.15rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .2s, border-color .2s, transform .2s;
  flex-shrink: 0;
  color: var(--text-primary);
}
.lib-theme-btn:hover {
  background: var(--bg-glass-hov);
  border-color: var(--accent-primary);
  transform: rotate(20deg) scale(1.1);
  box-shadow: var(--glow-primary);
}

/* ── Stats bar ────────────────────────────────────────────────────────────── */
.lib-stats-bar {
  display: flex; flex-wrap: wrap; gap: 10px;
  margin-bottom: 20px;
}
.lib-stat {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  font-size: .82rem; font-weight: 600;
  color: var(--text-secondary);
  transition: transform .18s, box-shadow .18s;
}
.lib-stat:hover { transform: translateY(-1px); box-shadow: var(--shadow-sm); }
.lib-stat .icon { font-size: 1.1rem; }
.lib-stat .val { font-size: 1rem; font-weight: 700; color: var(--text-primary); }

/* ── Search bar ───────────────────────────────────────────────────────────── */
.lib-search-row { position: relative; margin-bottom: 16px; }
.lib-search-row .icon-l {
  position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
  font-size: 1rem; pointer-events: none; color: var(--text-muted);
}
.lib-search-input {
  width: 100%;
  padding: 13px 44px 13px 46px;
  border: 1.5px solid var(--border);
  border-radius: 14px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  font-size: .95rem;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
}
.lib-search-input::placeholder { color: var(--text-muted); }
.lib-search-input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(167,139,250,.15);
}
.lib-search-clear {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; font-size: 1rem;
  color: var(--text-muted); opacity: 0; pointer-events: none;
  transition: opacity .2s;
  line-height: 1;
}
.lib-search-clear.show { opacity: 1; pointer-events: auto; }

/* ── Filter card ──────────────────────────────────────────────────────────── */
.lib-filters {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 18px 20px;
  margin-bottom: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 18px 20px;
  align-items: end;
}
.lib-filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.lib-filter-group.full { grid-column: 1 / -1; }

.lib-filter-label {
  font-size: .7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .07em;
  color: var(--text-muted);
}

/* chips */
.lib-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.lib-chip {
  padding: 5px 13px;
  border-radius: 99px;
  border: 1.5px solid var(--border);
  background: var(--bg-glass);
  color: var(--text-secondary);
  font-size: .78rem; font-weight: 600;
  cursor: pointer;
  transition: all .18s;
  white-space: nowrap;
  user-select: none;
}
.lib-chip:hover { border-color: var(--accent-primary); color: var(--accent-primary); }
.lib-chip.active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: #fff;
  box-shadow: 0 2px 10px rgba(167,139,250,.4);
}

/* select */
.lib-select {
  padding: 9px 32px 9px 14px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  background: var(--bg-glass);
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  font-size: .85rem;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 8L1 3h10z' fill='%238e96c0'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  outline: none;
  width: 100%;
  transition: border-color .2s;
}
.lib-select option { background: var(--bg-card); color: var(--text-primary); }
.lib-select:focus { border-color: var(--accent-primary); }

/* clear btn */
.lib-clear-btn {
  padding: 9px 18px;
  border: 1.5px solid var(--accent-coral);
  border-radius: 10px;
  background: transparent;
  color: var(--accent-coral);
  font-family: 'Inter', sans-serif;
  font-size: .8rem; font-weight: 700;
  cursor: pointer;
  align-self: flex-end;
  transition: all .18s;
  white-space: nowrap;
}
.lib-clear-btn:hover { background: var(--accent-coral); color: #fff; transform: scale(1.02); }

/* ── Meta + page-size row ─────────────────────────────────────────────────── */
.lib-meta-row {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 10px;
  margin-bottom: 12px;
}
.lib-result-count { font-size: .84rem; color: var(--text-secondary); }
.lib-result-count strong { color: var(--text-primary); }
.lib-page-size-row {
  display: flex; align-items: center; gap: 8px;
  font-size: .8rem; color: var(--text-muted);
}
.lib-page-size-row .lib-select { min-width: 70px; }

/* ── Table wrapper ─────────────────────────────────────────────────────────── */
.lib-table-wrap {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
}
.lib-table-scroll { overflow-x: auto; }

/* ── Table ─────────────────────────────────────────────────────────────────── */
.lib-table {
  width: 100%;
  border-collapse: collapse;
  font-size: .875rem;
}
.lib-table thead tr {
  background: var(--bg-glass);
  border-bottom: 1px solid var(--border);
}
.lib-table th {
  padding: 13px 16px;
  text-align: left;
  font-size: .7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--text-muted);
  white-space: nowrap;
}
.lib-table tbody tr {
  border-bottom: 1px solid var(--border);
  transition: background .16s, transform .16s;
}
.lib-table tbody tr:last-child { border-bottom: none; }
.lib-table tbody tr:hover {
  background: var(--bg-glass);
  transform: translateX(3px);
}
.lib-table td {
  padding: 13px 16px;
  vertical-align: middle;
  color: var(--text-secondary);
}

/* Sort header button */
.lib-sort-btn {
  background: none; border: none; cursor: pointer;
  font-family: inherit; font-size: .7rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .06em;
  color: var(--text-muted);
  display: inline-flex; align-items: center; gap: 4px; padding: 0;
  transition: color .18s;
}
.lib-sort-btn:hover { color: var(--accent-primary); }
.lib-sort-btn.sorted { color: var(--accent-primary); }
.lib-sort-btn.sort-asc::after  { content: ' ▲'; font-size: .6rem; }
.lib-sort-btn.sort-desc::after { content: ' ▼'; font-size: .6rem; }

/* Book title cell */
.lib-book-title {
  font-weight: 600;
  color: var(--text-primary);
  max-width: 260px;
  line-height: 1.35;
}
.lib-book-meta {
  font-size: .72rem;
  color: var(--text-muted);
  font-weight: 400;
  margin-top: 2px;
}

/* Year badge */
.lib-year-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 99px;
  background: rgba(167,139,250,.12);
  color: var(--accent-primary);
  font-size: .74rem; font-weight: 700;
}

/* Branch badge */
.lib-branch {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 11px;
  border-radius: 99px;
  font-size: .74rem; font-weight: 600;
  white-space: nowrap;
}
.lib-branch-CSE        { background: rgba(167,139,250,.14); color: var(--accent-primary); }
.lib-branch-ECE        { background: rgba(96,165,250,.14);  color: var(--accent-sky); }
.lib-branch-EE         { background: rgba(52,211,153,.14);  color: var(--accent-mint); }
.lib-branch-Civil      { background: rgba(251,191,36,.14);  color: var(--accent-amber); }
.lib-branch-Mechanical { background: rgba(248,113,113,.14); color: var(--accent-coral); }

/* Subject tag */
.lib-subject-tag {
  display: inline-block;
  padding: 3px 10px;
  background: var(--bg-glass);
  border: 1px solid var(--border);
  border-radius: 7px;
  font-size: .74rem; color: var(--text-secondary);
  max-width: 200px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* Availability badge */
.lib-avail {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 11px; border-radius: 99px;
  font-size: .74rem; font-weight: 600; white-space: nowrap;
}
.lib-avail.ok  { background: rgba(52,211,153,.14); color: var(--accent-mint); }
.lib-avail.out { background: rgba(248,113,113,.14); color: var(--accent-coral); }
.lib-avail.me  { background: rgba(167,139,250,.14); color: var(--accent-primary); }

/* Search highlight */
mark.lhl {
  background: rgba(251,191,36,.3);
  color: inherit;
  border-radius: 3px;
  padding: 0 2px;
}

/* Empty state */
.lib-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 52px 24px; gap: 10px;
}
.lib-empty .e-icon { font-size: 3.2rem; }
.lib-empty .e-title { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); }
.lib-empty .e-sub   { font-size: .85rem; color: var(--text-muted); }

/* ── Pagination ────────────────────────────────────────────────────────────── */
.lib-pagination {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--border);
}
.lib-page-info { font-size: .82rem; color: var(--text-muted); }
.lib-page-btns { display: flex; align-items: center; gap: 5px; }
.lib-pg {
  min-width: 34px; height: 34px;
  border-radius: 9px;
  border: 1.5px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: .84rem; font-family: inherit; font-weight: 600;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .18s; padding: 0 6px;
}
.lib-pg:hover:not(:disabled) {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  background: rgba(167,139,250,.08);
}
.lib-pg.active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: #fff;
  box-shadow: 0 2px 10px rgba(167,139,250,.4);
}
.lib-pg:disabled { opacity: .3; cursor: default; }

/* ── Action buttons ────────────────────────────────────────────────────────── */
.lib-btn-reserve {
  padding: 5px 13px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-primary2, #7c3aed));
  color: #fff;
  border: none; cursor: pointer; font-size: .78rem; font-weight: 700;
  font-family: inherit;
  box-shadow: 0 2px 8px rgba(124,58,237,.3);
  transition: transform .18s, box-shadow .18s;
  white-space: nowrap;
}
.lib-btn-reserve:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(124,58,237,.45); }

.lib-btn-return {
  padding: 5px 13px;
  border-radius: 8px;
  background: rgba(248,113,113,.12);
  color: var(--accent-coral);
  border: 1px solid var(--accent-coral);
  cursor: pointer; font-size: .78rem; font-weight: 700;
  font-family: inherit; transition: all .18s; white-space: nowrap;
}
.lib-btn-return:hover { background: var(--accent-coral); color: #fff; }

.lib-btn-unavail {
  padding: 5px 13px; border-radius: 8px;
  background: var(--bg-glass);
  color: var(--text-muted);
  border: 1px solid var(--border);
  cursor: default; font-size: .78rem; font-weight: 600; font-family: inherit;
}

/* Header actions group */
.lib-header-actions {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}

/* Barcode / ISBN cell */
.lib-isbn-cell {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
}
.lib-barcode-svg {
  width: 110px; height: 36px; display: block;
}
.lib-isbn-num {
  font-family: 'Courier New', monospace;
  font-size: .68rem; color: var(--text-muted);
  letter-spacing: .03em;
  white-space: nowrap;
}
    `;
    document.head.appendChild(el);
  }

  /* ── Escape + Highlight ─────────────────────────────────────────────────── */
  function _e(s) {
    return String(s||'')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function _hl(text, q) {
    if (!q) return _e(text);
    const safe = _e(text);
    const safeQ = _e(q).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    return safe.replace(new RegExp(`(${safeQ})`, 'gi'), '<mark class="lhl">$1</mark>');
  }

  /* ── Theme toggle ───────────────────────────────────────────────────────── */
  function _toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') !== 'light';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    document.getElementById('lib-theme-icon').textContent = isDark ? '🌙' : '☀️';
  }
  function _themeIcon() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? '🌙' : '☀️';
  }

  /* ── Main render ────────────────────────────────────────────────────────── */
  function render() {
    _injectCSS();
    allBooks = [...BPUT_BOOKS_FLAT];

    const panel = document.getElementById('panel-library');
    const total  = allBooks.length;
    const availN = allBooks.filter(b => b.available).length;
    const subjN  = new Set(allBooks.map(b => b.subjectName)).size;
    const branches = BPUT_BRANCHES;

    panel.innerHTML = `
      <!-- Header row -->
      <div class="lib-header-row">
        <div>
          <h2>📚 BPUT Library Catalogue</h2>
          <p>Biju Patnaik University of Technology · All Branches · All Years</p>
        </div>
        <div class="lib-header-actions">
          <button class="lib-scan-btn" onclick="BarcodeModule.manualSearch()" title="Enter ISBN manually">
            🔢 ISBN Search
          </button>
          <button class="lib-scan-btn" onclick="BarcodeModule.openScanner()" title="Scan barcode with camera">
            📷 Scan Book
          </button>
        </div>
      </div>

      <!-- Stats bar -->
      <div class="lib-stats-bar">
        <div class="lib-stat">
          <span class="icon">📦</span>
          <span class="val" id="ls-total">${total}</span>
          <span>Books</span>
        </div>
        <div class="lib-stat">
          <span class="icon">✅</span>
          <span class="val" id="ls-avail" style="color:var(--accent-mint)">${availN}</span>
          <span>Available</span>
        </div>
        <div class="lib-stat">
          <span class="icon">⏳</span>
          <span class="val" id="ls-issued" style="color:var(--accent-coral)">${total - availN}</span>
          <span>Issued</span>
        </div>
        <div class="lib-stat">
          <span class="icon">🏫</span>
          <span class="val">${subjN}</span>
          <span>Subjects</span>
        </div>
      </div>

      <!-- Search -->
      <div class="lib-search-row">
        <span class="icon-l">🔍</span>
        <input type="search" id="lib-q" class="lib-search-input"
          placeholder="Search by title, author, subject or branch…"
          oninput="LibraryModule._onSearch(this.value)"
          autocomplete="off" />
        <button id="lib-qclr" class="lib-search-clear" onclick="LibraryModule._clearQ()">✕</button>
      </div>

      <!-- Filters -->
      <div class="lib-filters">

        <!-- Branch -->
        <div class="lib-filter-group">
          <span class="lib-filter-label">🏛️ Branch</span>
          <div class="lib-chips" id="lib-branch-chips">
            <span class="lib-chip active" onclick="LibraryModule._setBranch('',this)">All</span>
            ${branches.map(b => {
              const info = BRANCH_INFO[b] || {};
              return `<span class="lib-chip" onclick="LibraryModule._setBranch('${b}',this)">${info.icon||''} ${b}</span>`;
            }).join('')}
          </div>
        </div>

        <!-- Year (hidden until branch selected) -->
        <div class="lib-filter-group" id="lib-year-group" style="display:none">
          <span class="lib-filter-label">📅 Year</span>
          <div class="lib-chips" id="lib-year-chips"></div>
        </div>

        <!-- Subject -->
        <div class="lib-filter-group">
          <label class="lib-filter-label" for="lib-subj-sel">📘 Subject</label>
          <select id="lib-subj-sel" class="lib-select" onchange="LibraryModule._setSubj(this.value)">
            <option value="">All Subjects</option>
          </select>
        </div>

        <!-- Sort -->
        <div class="lib-filter-group">
          <label class="lib-filter-label" for="lib-sort-sel">⬆⬇ Sort By</label>
          <select id="lib-sort-sel" class="lib-select" onchange="LibraryModule._sortDrop(this.value)">
            <option value="">— Default —</option>
            <option value="title-asc">Title A → Z</option>
            <option value="title-desc">Title Z → A</option>
            <option value="author-asc">Author A → Z</option>
            <option value="author-desc">Author Z → A</option>
            <option value="year-asc">Year (Oldest first)</option>
            <option value="year-desc">Year (Newest first)</option>
          </select>
        </div>

        <!-- Availability -->
        <div class="lib-filter-group">
          <span class="lib-filter-label">📋 Availability</span>
          <div class="lib-chips" id="lib-avail-chips">
            <span class="lib-chip active" onclick="LibraryModule._setAvail('all',this)">All</span>
            <span class="lib-chip" onclick="LibraryModule._setAvail('avail',this)">✅ Available</span>
            <span class="lib-chip" onclick="LibraryModule._setAvail('issued',this)">⏳ Issued</span>
          </div>
        </div>

        <!-- Clear filters -->
        <div class="lib-filter-group" style="justify-content:flex-end">
          <button class="lib-clear-btn" onclick="LibraryModule._clearAll()">✕ Clear Filters</button>
        </div>

      </div>

      <!-- Meta row -->
      <div class="lib-meta-row">
        <p class="lib-result-count" id="lib-count">Loading…</p>
        <div class="lib-page-size-row">
          <label for="lib-perpage">Rows:</label>
          <select id="lib-perpage" class="lib-select" onchange="LibraryModule._setPerPage(this.value)">
            <option value="5">5</option>
            <option value="10" selected>10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="lib-table-wrap">
        <div class="lib-table-scroll">
          <table class="lib-table">
            <thead>
              <tr>
                <th><button class="lib-sort-btn" data-f="title"  onclick="LibraryModule._sortCol('title')">Title</button></th>
                <th><button class="lib-sort-btn" data-f="author" onclick="LibraryModule._sortCol('author')">Author</button></th>
                <th><button class="lib-sort-btn" data-f="year"   onclick="LibraryModule._sortCol('year')">Year</button></th>
                <th>Branch</th>
                <th>Subject</th>
                <th>Copies</th>
                <th>Barcode / ISBN</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="lib-body"></tbody>
          </table>
        </div>
        <div class="lib-pagination">
          <span class="lib-page-info" id="lib-pg-info">Page 1 of 1</span>
          <div class="lib-page-btns">
            <button class="lib-pg" id="lib-prev" onclick="LibraryModule._go(LibraryModule.page-1)">‹</button>
            <div id="lib-pg-nums" style="display:flex;gap:4px;"></div>
            <button class="lib-pg" id="lib-next" onclick="LibraryModule._go(LibraryModule.page+1)">›</button>
          </div>
        </div>
      </div>`;

    _populateSubjects();
    _filter();
  }

  /* ── Subject dropdown ───────────────────────────────────────────────────── */
  function _populateSubjects() {
    const sel = document.getElementById('lib-subj-sel');
    if (!sel) return;
    let pool = allBooks;
    if (branch) pool = pool.filter(b => b.branch === branch);
    if (yearFilter) pool = pool.filter(b => b.year === yearFilter);
    const subjects = [...new Set(pool.map(b => b.subjectName))].sort();
    sel.innerHTML = `<option value="">All Subjects</option>` +
      subjects.map(s => `<option value="${_e(s)}"${s===subject?' selected':''}>${_e(s)}</option>`).join('');
  }

  /* ── Core filter + sort pipeline ────────────────────────────────────────── */
  function _filter() {
    let res = [...allBooks];
    if (branch)     res = res.filter(b => b.branch === branch);
    if (yearFilter) res = res.filter(b => b.year === yearFilter);
    if (subject)    res = res.filter(b => b.subjectName === subject);
    if (avail === 'avail')  res = res.filter(b => b.available);
    if (avail === 'issued') res = res.filter(b => !b.available);
    if (query) {
      const q = query.toLowerCase();
      res = res.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.subjectName.toLowerCase().includes(q) ||
        b.branch.toLowerCase().includes(q) ||
        (b.publisher && b.publisher.toLowerCase().includes(q))
      );
    }
    if (sortField) {
      const dir = sortDir === 'asc' ? 1 : -1;
      res.sort((a, b) => {
        if (sortField === 'year') return (a.year - b.year) * dir;
        const va = (sortField === 'title' ? a.title : a.author).toLowerCase();
        const vb = (sortField === 'title' ? b.title : b.author).toLowerCase();
        return va < vb ? -dir : va > vb ? dir : 0;
      });
    }
    filtered = res;
    page = Math.min(page, Math.max(1, Math.ceil(filtered.length / perPage)));
    _renderRows();
    _renderBarcodes();
    _renderCount();
    _renderPagination();
  }

  /* ── Render rows ────────────────────────────────────────────────────────── */
  function _renderRows() {
    const body = document.getElementById('lib-body');
    if (!body) return;
    const start = (page - 1) * perPage;
    const rows  = filtered.slice(start, start + perPage);
    if (!rows.length) {
      body.innerHTML = `<tr><td colspan="7"><div class="lib-empty">
        <div class="e-icon">🔍</div>
        <div class="e-title">No books found</div>
        <div class="e-sub">Try adjusting filters or clearing your search.</div>
        <button class="lib-clear-btn" style="margin-top:6px" onclick="LibraryModule._clearAll()">Clear Filters</button>
      </div></td></tr>`;
      return;
    }
    const issuedIds = AppState.student.issuedBooks || [];
    body.innerHTML = rows.map(book => {
      const mine = issuedIds.includes(book.id);
      const branchCls = `lib-branch-${book.branch.replace(/\s+/g, '')}`;
      const q = query;

      const availEl = mine
        ? `<span class="lib-avail me">📌 Reserved</span>`
        : book.available
          ? `<span class="lib-avail ok">✅ ${book.availableCopies}/${book.totalCopies}</span>`
          : `<span class="lib-avail out">⏳ Issued</span>`;

      const action = mine
        ? `<button class="lib-btn-return" onclick="LibraryModule.returnBook('${book.id}')">↩ Return</button>`
        : book.available
          ? `<button class="lib-btn-reserve" onclick="LibraryModule.reserveBook('${book.id}')">📌 Reserve</button>`
          : `<button class="lib-btn-unavail" disabled>Unavailable</button>`;

      return `<tr>
        <td>
          <div class="lib-book-title">${_hl(book.title, q)}</div>
          <div class="lib-book-meta">${_e(book.publisher)} · ${_e(book.edition)} Ed.</div>
        </td>
        <td>${_hl(book.author, q)}</td>
        <td><span class="lib-year-badge">${_e(String(book.year))}</span></td>
        <td><span class="lib-branch ${branchCls}">${(BRANCH_INFO[book.branch]||{}).icon||''} ${_e(book.branch)}</span></td>
        <td><span class="lib-subject-tag" title="${_e(book.subjectName)}">${_hl(book.subjectName, q)}</span></td>
        <td>${availEl}</td>
        <td>
          ${book.ISBN
            ? `<div class="lib-isbn-cell">
                <svg class="lib-barcode-svg" id="bc-svg-${_e(book.id)}"></svg>
                <div class="lib-isbn-num">${_e(book.ISBN)}</div>
               </div>`
            : '<span style="color:var(--text-muted);font-size:.75rem">—</span>'
          }
        </td>
        <td>${action}</td>
      </tr>`;
    }).join('');
  }

  /* ── Render inline barcodes via JsBarcode ──────────────────────────────── */
  function _renderBarcodes() {
    if (typeof JsBarcode === 'undefined') return;
    const svgs = document.querySelectorAll('.lib-barcode-svg');
    svgs.forEach(svg => {
      const id = svg.id; // bc-svg-{bookId}
      const bookId = id.replace('bc-svg-', '');
      const book = filtered.find(b => String(b.id) === String(bookId));
      if (!book || !book.ISBN) return;
      try {
        JsBarcode(svg, book.ISBN, {
          format: 'CODE128', lineColor: 'currentColor',
          width: 1.2, height: 30,
          displayValue: false, margin: 0,
        });
        svg.style.color = 'var(--text-secondary)';
      } catch(e) { /* invalid barcode — leave blank */ }
    });
  }

  /* ── Result count ───────────────────────────────────────────────────────── */
  function _renderCount() {
    const el = document.getElementById('lib-count');
    if (!el) return;
    const total = filtered.length;
    if (!total) { el.innerHTML = '<strong>0</strong> books found'; return; }
    const s = (page - 1) * perPage + 1;
    const e = Math.min(page * perPage, total);
    el.innerHTML = `Showing <strong>${s}–${e}</strong> of <strong>${total}</strong> books`;
  }

  /* ── Pagination ─────────────────────────────────────────────────────────── */
  function _renderPagination() {
    const tp = Math.max(1, Math.ceil(filtered.length / perPage));
    const info = document.getElementById('lib-pg-info');
    if (info) info.textContent = `Page ${page} of ${tp}`;

    const nums = document.getElementById('lib-pg-nums');
    if (nums) {
      const d = 2, l = Math.max(1, page-d), r = Math.min(tp, page+d);
      const pages = [];
      if (l > 1)  { pages.push(1); if (l > 2) pages.push('…'); }
      for (let p = l; p <= r; p++) pages.push(p);
      if (r < tp) { if (r < tp-1) pages.push('…'); pages.push(tp); }
      nums.innerHTML = pages.map(p =>
        p === '…'
          ? `<button class="lib-pg" disabled>…</button>`
          : `<button class="lib-pg${p===page?' active':''}" onclick="LibraryModule._go(${p})">${p}</button>`
      ).join('');
    }
    const prev = document.getElementById('lib-prev');
    const next = document.getElementById('lib-next');
    if (prev) prev.disabled = page === 1;
    if (next) next.disabled = page === tp;
  }

  /* ── Sort headers update ────────────────────────────────────────────────── */
  function _updateSortHeaders() {
    document.querySelectorAll('.lib-sort-btn').forEach(btn => {
      btn.classList.remove('sorted','sort-asc','sort-desc');
      if (btn.dataset.f === sortField) {
        btn.classList.add('sorted', sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
      }
    });
  }

  /* ── Event handlers ─────────────────────────────────────────────────────── */
  function _onSearch(v) {
    query = v.trim();
    const clr = document.getElementById('lib-qclr');
    if (clr) clr.classList.toggle('show', !!query);
    page = 1; _filter();
  }

  function _clearQ() {
    const inp = document.getElementById('lib-q');
    if (inp) inp.value = '';
    _onSearch('');
  }

  function _setBranch(b, chip) {
    branch = b; subject = ''; yearFilter = 0; page = 1;
    _chipActive('lib-branch-chips', chip);
    const yg = document.getElementById('lib-year-group');
    if (b) {
      yg.style.display = '';
      const years = [...new Set(BPUT_CURRICULUM.filter(s => s.branch === b).map(s => s.year))].sort();
      document.getElementById('lib-year-chips').innerHTML =
        `<span class="lib-chip active" onclick="LibraryModule._setYear(0,this)">All</span>` +
        years.map(y => `<span class="lib-chip" onclick="LibraryModule._setYear(${y},this)">Year ${y}</span>`).join('');
    } else {
      yg.style.display = 'none';
    }
    _populateSubjects(); _filter();
  }

  function _setYear(y, chip) {
    yearFilter = y; page = 1;
    _chipActive('lib-year-chips', chip);
    _populateSubjects(); _filter();
  }

  function _setSubj(v) { subject = v; page = 1; _filter(); }

  function _setAvail(v, chip) {
    avail = v; page = 1;
    _chipActive('lib-avail-chips', chip); _filter();
  }

  function _sortCol(f) {
    if (sortField === f) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    else { sortField = f; sortDir = 'asc'; }
    page = 1; _updateSortHeaders(); _filter();
  }

  function _sortDrop(v) {
    if (!v) { sortField = null; sortDir = 'asc'; }
    else { [sortField, sortDir] = v.split('-'); }
    page = 1; _updateSortHeaders(); _filter();
  }

  function _go(p) {
    const tp = Math.max(1, Math.ceil(filtered.length / perPage));
    page = Math.max(1, Math.min(p, tp));
    _renderRows(); _renderCount(); _renderPagination();
    document.querySelector('.lib-table-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function _setPerPage(v) { perPage = parseInt(v) || 10; page = 1; _filter(); }

  function _clearAll() {
    branch = ''; subject = ''; yearFilter = 0; avail = 'all'; query = ''; sortField = null; sortDir = 'asc'; page = 1;
    const inp = document.getElementById('lib-q');
    if (inp) inp.value = '';
    const clr = document.getElementById('lib-qclr');
    if (clr) clr.classList.remove('show');
    document.querySelectorAll('#lib-branch-chips .lib-chip').forEach((c,i) => c.classList.toggle('active', i===0));
    document.querySelectorAll('#lib-avail-chips .lib-chip').forEach((c,i) => c.classList.toggle('active', i===0));
    const yg = document.getElementById('lib-year-group');
    if (yg) yg.style.display = 'none';
    const sortSel = document.getElementById('lib-sort-sel');
    if (sortSel) sortSel.value = '';
    _updateSortHeaders(); _populateSubjects(); _filter();
  }

  function _chipActive(containerId, chip) {
    const c = document.getElementById(containerId);
    if (c) c.querySelectorAll('.lib-chip').forEach(x => x.classList.remove('active'));
    if (chip) chip.classList.add('active');
  }

  /* ── Reserve / Return (with XP + gamification) ──────────────────────────── */
  function reserveBook(id) {
    const book = allBooks.find(b => b.id === id);
    if (!book || !book.available) return;
    if (!AppState.student.issuedBooks) AppState.student.issuedBooks = [];
    AppState.student.issuedBooks.push(id);
    book.availableCopies = Math.max(0, book.availableCopies - 1);
    book.available = book.availableCopies > 0;
    AppState.save();
    Gamification.checkAndAwardBadge('bookworm');
    Gamification.awardXP(10);
    const due = new Date(); due.setDate(due.getDate() + 14);
    if (typeof Settings !== 'undefined') Settings.notify(`📚 "${book.title}" reserved! Due: ${due.toDateString()}`);
    Gamification.showToast(`📚 "${book.title}" reserved! Return by ${due.toDateString()}.`, 'success');
    _renderRows();
  }

  function returnBook(id) {
    const book = allBooks.find(b => b.id === id);
    if (!book) return;
    AppState.student.issuedBooks = (AppState.student.issuedBooks || []).filter(i => i !== id);
    book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
    book.available = true;
    AppState.save();
    Gamification.awardXP(5);
    if (typeof Settings !== 'undefined') Settings.notify(`✅ "${book.title}" returned successfully.`);
    Gamification.showToast(`✅ "${book.title}" returned. Thank you!`, 'info');
    _renderRows();
  }

  /* ── Legacy search alias ─────────────────────────────────────────────────── */
  function search(q) { _onSearch(q); }

  /* ── Public API ─────────────────────────────────────────────────────────── */
  return {
    render, search, reserveBook, returnBook,
    _toggleTheme, _onSearch, _clearQ,
    _setBranch, _setYear, _setSubj, _setAvail,
    _sortCol, _sortDrop, _go, _setPerPage, _clearAll,
    filterBySubject: s => { _setSubj(s); },
    get page() { return page; },
  };

})();
