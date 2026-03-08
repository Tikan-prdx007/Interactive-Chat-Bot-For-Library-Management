/**
 * js/library-browse.js
 * SHELFBOT — Library Browse & Search Module
 *
 * Features:
 *  • CSV parsing via fetch() + custom parser → JSON
 *  • Live search (title, author, subject, department)
 *  • Branch filter chips
 *  • Subject dropdown (dynamic per branch)
 *  • Sort by Year / Author / Title (asc / desc) via column header clicks
 *  • Pagination with configurable page size
 *  • Result count display
 *  • Highlight matching search terms
 *  • Clear filters button
 *  • No page reloads — all client-side
 */

// ─── Configuration ─────────────────────────────────────────────────────────
const CONFIG = {
  csvPath: 'books.csv',
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 20, 50],
};

// ─── Department metadata ────────────────────────────────────────────────────
const DEPT_META = {
  'Computer Science': { emoji: '💻', cls: 'dept-cs',  label: 'CS' },
  'Mechanical':       { emoji: '⚙️', cls: 'dept-me',  label: 'ME' },
  'Electrical':       { emoji: '⚡', cls: 'dept-ee',  label: 'EE' },
  'Civil':            { emoji: '🏗️', cls: 'dept-cv',  label: 'CV' },
};

// ─── State ──────────────────────────────────────────────────────────────────
let allBooks      = [];   // full dataset from CSV
let filteredBooks = [];   // after search + filters + sort
let currentPage   = 1;
let pageSize      = CONFIG.defaultPageSize;
let searchQuery   = '';
let activeBranch  = '';   // '' = all
let activeSubject = '';
let sortField     = null; // 'title' | 'author' | 'year'
let sortDir       = 'asc';

// ─── CSV Parser ─────────────────────────────────────────────────────────────
/**
 * Parses a CSV string into an array of objects.
 * Handles quoted fields with embedded commas / newlines.
 * @param {string} csvText
 * @returns {object[]}
 */
function parseCSV(csvText) {
  const lines = csvText.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = [];
    let current  = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        // escaped quote inside quoted field
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (ch === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    values.push(current.trim()); // last field

    // Map to object
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = values[idx] ?? ''; });
    return obj;
  }).filter(obj => obj.BookID && obj.Title); // skip blank rows
}

// ─── Inline CSV fallback (used when fetch() cannot reach books.csv,
//     e.g. when opening library.html directly via file:// protocol) ──────────
const INLINE_CSV = `BookID,Title,Author,Year,Department,Subject
CS001,Introduction to Algorithms,Thomas H. Cormen,2009,Computer Science,Algorithms
CS002,Data Structures and Algorithm Analysis in C,Mark Allen Weiss,2012,Computer Science,Data Structures
CS003,Operating System Concepts,Abraham Silberschatz,2018,Computer Science,Operating Systems
CS004,Artificial Intelligence: A Modern Approach,Stuart Russell,2020,Computer Science,Artificial Intelligence
CS005,Computer Networks,Andrew S. Tanenbaum,2011,Computer Science,Computer Networks
CS006,Database System Concepts,Abraham Silberschatz,2019,Computer Science,Database Management
CS007,Computer Organization and Architecture,William Stallings,2016,Computer Science,Computer Architecture
CS008,Compiler Design,Alfred V. Aho,2006,Computer Science,Compiler Design
CS009,Software Engineering,Ian Sommerville,2015,Computer Science,Software Engineering
CS010,Design Patterns: Elements of Reusable Object-Oriented Software,Erich Gamma,1994,Computer Science,Software Engineering
CS011,The C Programming Language,Brian W. Kernighan,1988,Computer Science,Programming Languages
CS012,Java: The Complete Reference,Herbert Schildt,2021,Computer Science,Programming Languages
CS013,Python Crash Course,Eric Matthes,2019,Computer Science,Programming Languages
CS014,Machine Learning: A Probabilistic Perspective,Kevin P. Murphy,2012,Computer Science,Artificial Intelligence
CS015,Deep Learning,Ian Goodfellow,2016,Computer Science,Artificial Intelligence
CS016,Computer Graphics: Principles and Practice,John F. Hughes,2013,Computer Science,Computer Graphics
CS017,Theory of Computation,Michael Sipser,2012,Computer Science,Theory of Computation
CS018,Discrete Mathematics and Its Applications,Kenneth H. Rosen,2018,Computer Science,Discrete Mathematics
CS019,Digital Logic and Computer Design,Morris Mano,2017,Computer Science,Digital Electronics
CS020,Cloud Computing: Concepts Technology and Architecture,Thomas Erl,2013,Computer Science,Cloud Computing
ME001,Engineering Thermodynamics,P.K. Nag,2013,Mechanical,Thermodynamics
ME002,Fluid Mechanics,Frank M. White,2016,Mechanical,Fluid Mechanics
ME003,Machine Design,V.B. Bhandari,2014,Mechanical,Machine Design
ME004,Strength of Materials,R.K. Bansal,2016,Mechanical,Strength of Materials
ME005,Theory of Machines,S.S. Rattan,2009,Mechanical,Theory of Machines
ME006,Heat Transfer,J.P. Holman,2010,Mechanical,Heat Transfer
ME007,Manufacturing Engineering and Technology,Kalpakjian,2013,Mechanical,Manufacturing Engineering
ME008,Engineering Mechanics: Statics and Dynamics,R.C. Hibbeler,2016,Mechanical,Engineering Mechanics
ME009,Refrigeration and Air Conditioning,C.P. Arora,2009,Mechanical,HVAC
ME010,Industrial Engineering and Management,O.P. Khanna,2012,Mechanical,Industrial Engineering
ME011,Finite Element Method,O.C. Zienkiewicz,2005,Mechanical,FEM Analysis
ME012,Turbomachinery,B.K. Venkanna,2009,Mechanical,Fluid Mechanics
ME013,Metrology and Quality Control,R.K. Jain,2014,Mechanical,Metrology
ME014,Kinematics and Dynamics of Machines,George H. Martin,2002,Mechanical,Theory of Machines
ME015,Advanced Engineering Thermodynamics,Adrian Bejan,2006,Mechanical,Thermodynamics
EE001,Principles of Electric Circuits,Thomas L. Floyd,2014,Electrical,Electric Circuits
EE002,Electrical Machinery Fundamentals,Stephen J. Chapman,2011,Electrical,Electrical Machines
EE003,Power Systems Analysis,Bergen and Vittal,2000,Electrical,Power Systems
EE004,Control Systems Engineering,Norman S. Nise,2015,Electrical,Control Systems
EE005,Electronic Devices and Circuit Theory,Robert L. Boylestad,2012,Electrical,Electronic Circuits
EE006,Signals and Systems,Alan V. Oppenheim,2009,Electrical,Signals and Systems
EE007,Electromagnetics,William H. Hayt,2011,Electrical,Electromagnetics
EE008,Power Electronics,Muhammad H. Rashid,2014,Electrical,Power Electronics
EE009,Digital Signal Processing,J.G. Proakis,2006,Electrical,Digital Signal Processing
EE010,Microprocessors and Microcontrollers,A. Nagoor Kani,2012,Electrical,Microprocessors
EE011,Renewable Energy Engineering,Nicholas Jenkins,2010,Electrical,Renewable Energy
EE012,Electrical Power Transmission and Distribution,S.L. Uppal,2005,Electrical,Power Systems
EE013,Analog and Digital Communications,Haykin,2006,Electrical,Communications
EE014,Semiconductor Physics and Devices,Donald A. Neamen,2011,Electrical,Electronic Circuits
EE015,Introduction to Robotics,John J. Craig,2004,Electrical,Robotics
CV001,Structural Analysis,R.C. Hibbeler,2017,Civil,Structural Analysis
CV002,Soil Mechanics and Foundation Engineering,K.R. Arora,2008,Civil,Soil Mechanics
CV003,Fluid Mechanics and Hydraulics,R.K. Bansal,2015,Civil,Fluid Mechanics
CV004,Transportation Engineering,C.E.G. Justo,2013,Civil,Transportation Engineering
CV005,Environmental Engineering,S.K. Garg,2010,Civil,Environmental Engineering
CV006,Concrete Technology,M.S. Shetty,2013,Civil,Construction Materials
CV007,Surveying,B.C. Punmia,2016,Civil,Surveying
CV008,Design of Steel Structures,L.S. Negi,2004,Civil,Structural Design
CV009,Reinforced Cement Concrete,B.C. Punmia,2015,Civil,Structural Design
CV010,Hydraulic Machines,Jagdish Lal,2006,Civil,Fluid Mechanics
CV011,Water Supply and Sanitary Engineering,G.S. Birdie,2011,Civil,Environmental Engineering
CV012,Remote Sensing and GIS,Anji Reddy,2008,Civil,Geotechnical Engineering
CV013,Quantity Surveying and Valuation,B.N. Dutta,2010,Civil,Quantity Surveying
CV014,Highway Engineering,S.K. Khanna,2009,Civil,Transportation Engineering
CV015,Construction Planning and Management,P.S. Gahlot,2013,Civil,Project Management`;

// ─── Data Loading ────────────────────────────────────────────────────────────
/**
 * Tries to load books.csv via fetch() (works on a local server).
 * Falls back to the INLINE_CSV constant when running under file:// protocol
 * or when the server is unavailable.
 */
async function loadBooks() {
  showSkeleton();
  try {
    const res = await fetch(CONFIG.csvPath);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    _initData(text);
  } catch (err) {
    // Fallback: use embedded CSV data (works with file:// protocol)
    console.warn('fetch() failed — using inline dataset. To load from books.csv, run via a local server.', err.message);
    _initData(INLINE_CSV);
  }
}

function _initData(csvText) {
  allBooks = parseCSV(csvText);
  // Normalise Year field as number for proper sorting
  allBooks.forEach(b => { b._year = parseInt(b.Year, 10) || 0; });
  filteredBooks = [...allBooks];
  populateSubjectDropdown();
  renderTable();
  updateStats();
}

// ─── Search ──────────────────────────────────────────────────────────────────
function handleSearch(query) {
  searchQuery = query.trim();
  // Toggle clear button visibility
  const clearBtn = document.getElementById('search-clear-btn');
  if (clearBtn) clearBtn.classList.toggle('visible', searchQuery.length > 0);
  currentPage = 1;
  applyFiltersAndRender();
}

// ─── Branch Filter ────────────────────────────────────────────────────────────
function setBranch(branch, chipEl) {
  activeBranch  = branch;
  activeSubject = '';
  currentPage   = 1;

  // Update chip active state
  document.querySelectorAll('.branch-chip').forEach(c => c.classList.remove('active'));
  chipEl.classList.add('active');

  // Refresh subject dropdown for selected branch
  populateSubjectDropdown();
  applyFiltersAndRender();
}

// ─── Subject Filter ───────────────────────────────────────────────────────────
function populateSubjectDropdown() {
  const sel = document.getElementById('subject-select');
  if (!sel) return;

  // Collect subjects for current branch (or all)
  const pool    = activeBranch ? allBooks.filter(b => b.Department === activeBranch) : allBooks;
  const subjects = [...new Set(pool.map(b => b.Subject).filter(Boolean))].sort();

  sel.innerHTML = `<option value="">All Subjects</option>` +
    subjects.map(s => `<option value="${s}"${s === activeSubject ? ' selected' : ''}>${s}</option>`).join('');

  sel.onchange = () => {
    activeSubject = sel.value;
    currentPage   = 1;
    applyFiltersAndRender();
  };
}

// ─── Sort ─────────────────────────────────────────────────────────────────────
function toggleSort(field) {
  if (sortField === field) {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    sortField = field;
    sortDir   = 'asc';
  }
  currentPage = 1;
  updateSortHeaders();
  applyFiltersAndRender();
}

function updateSortHeaders() {
  document.querySelectorAll('.sort-btn').forEach(btn => {
    const f = btn.dataset.field;
    btn.classList.remove('sort-asc', 'sort-desc', 'sorted');
    if (f === sortField) {
      btn.classList.add('sorted', sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
    }
  });
}

// ─── Core Filter + Sort Pipeline ─────────────────────────────────────────────
function applyFiltersAndRender() {
  let results = [...allBooks];

  // 1. Branch filter
  if (activeBranch) {
    results = results.filter(b => b.Department === activeBranch);
  }

  // 2. Subject filter
  if (activeSubject) {
    results = results.filter(b => b.Subject === activeSubject);
  }

  // 3. Search filter (multi-field)
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    results = results.filter(b =>
      b.Title.toLowerCase().includes(q) ||
      b.Author.toLowerCase().includes(q) ||
      b.Subject.toLowerCase().includes(q) ||
      b.Department.toLowerCase().includes(q) ||
      (b.BookID && b.BookID.toLowerCase().includes(q))
    );
  }

  // 4. Sort
  if (sortField) {
    const dir = sortDir === 'asc' ? 1 : -1;
    results.sort((a, b) => {
      let va, vb;
      if (sortField === 'year')   { va = a._year; vb = b._year; return (va - vb) * dir; }
      if (sortField === 'title')  { va = a.Title.toLowerCase(); vb = b.Title.toLowerCase(); }
      if (sortField === 'author') { va = a.Author.toLowerCase(); vb = b.Author.toLowerCase(); }
      return va < vb ? -dir : va > vb ? dir : 0;
    });
  }

  filteredBooks = results;
  renderTable();
}

// ─── Clear Filters ────────────────────────────────────────────────────────────
function clearFilters() {
  searchQuery   = '';
  activeBranch  = '';
  activeSubject = '';
  sortField     = null;
  sortDir       = 'asc';
  currentPage   = 1;

  // Reset search input
  const inp = document.getElementById('lib-search');
  if (inp) inp.value = '';
  const clearBtn = document.getElementById('search-clear-btn');
  if (clearBtn) clearBtn.classList.remove('visible');

  // Reset branch chips
  document.querySelectorAll('.branch-chip').forEach((c, i) => {
    c.classList.toggle('active', i === 0); // first = "All"
  });

  // Reset subject dropdown
  populateSubjectDropdown();

  // Reset sort headers
  updateSortHeaders();

  filteredBooks = [...allBooks];
  renderTable();
}

// ─── Pagination helpers ───────────────────────────────────────────────────────
function getTotalPages() {
  return Math.max(1, Math.ceil(filteredBooks.length / pageSize));
}

function getPagedBooks() {
  const start = (currentPage - 1) * pageSize;
  return filteredBooks.slice(start, start + pageSize);
}

// ─── Highlight helper ─────────────────────────────────────────────────────────
function highlight(text, query) {
  if (!query) return escHtml(text);
  const safe = escHtml(text);
  const safeQ = escHtml(query);
  const re = new RegExp(`(${safeQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return safe.replace(re, '<mark class="hl">$1</mark>');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// ─── Table Rendering ──────────────────────────────────────────────────────────
function renderTable() {
  renderResultsMeta();
  renderRows();
  renderPagination();
}

function renderResultsMeta() {
  const el = document.getElementById('result-count');
  if (!el) return;
  const start = filteredBooks.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end   = Math.min(currentPage * pageSize, filteredBooks.length);
  el.innerHTML = filteredBooks.length === 0
    ? `<strong>0</strong> books found`
    : `Showing <strong>${start}–${end}</strong> of <strong>${filteredBooks.length}</strong> books`;
}

function renderRows() {
  const tbody = document.getElementById('books-tbody');
  if (!tbody) return;

  const paged = getPagedBooks();
  const q     = searchQuery;

  if (paged.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <div class="empty-title">No books found</div>
            <div class="empty-sub">Try adjusting your search or clearing the filters.</div>
            <button class="btn-reset-empty" onclick="clearFilters()">Clear Filters</button>
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = paged.map(b => {
    const meta = DEPT_META[b.Department] || { emoji: '📖', cls: 'dept-cs', label: b.Department };
    return `
      <tr>
        <td class="td-id">${escHtml(b.BookID)}</td>
        <td class="td-title">${highlight(b.Title, q)}</td>
        <td class="td-author">${highlight(b.Author, q)}</td>
        <td class="td-year"><span class="year-badge">${escHtml(b.Year)}</span></td>
        <td class="td-dept">
          <span class="dept-badge ${meta.cls}">
            ${meta.emoji} ${highlight(b.Department, q)}
          </span>
        </td>
        <td class="td-subject">
          <span class="subject-tag">${highlight(b.Subject, q)}</span>
        </td>
      </tr>`;
  }).join('');
}

function renderPagination() {
  const totalPages = getTotalPages();
  const container  = document.getElementById('pagination-controls');
  if (!container) return;

  // Page info text
  const infoEl = document.getElementById('page-info');
  if (infoEl) infoEl.textContent = `Page ${currentPage} of ${totalPages}`;

  // Build page number buttons (show up to 5 around current)
  const pageNums = document.getElementById('page-nums');
  if (!pageNums) return;

  const delta  = 2;
  const left   = Math.max(1, currentPage - delta);
  const right  = Math.min(totalPages, currentPage + delta);
  const pages  = [];

  if (left > 1)  { pages.push(1); if (left > 2) pages.push('…'); }
  for (let p = left; p <= right; p++) pages.push(p);
  if (right < totalPages) { if (right < totalPages - 1) pages.push('…'); pages.push(totalPages); }

  pageNums.innerHTML = pages.map(p =>
    p === '…'
      ? `<button class="page-btn" disabled>…</button>`
      : `<button class="page-btn${p === currentPage ? ' active' : ''}" onclick="goToPage(${p})">${p}</button>`
  ).join('');

  // Prev / Next disability
  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');
  if (prevBtn) prevBtn.disabled = currentPage === 1;
  if (nextBtn) nextBtn.disabled = currentPage === totalPages;
}

function goToPage(p) {
  const tp = getTotalPages();
  currentPage = Math.max(1, Math.min(p, tp));
  renderTable();
  // Scroll to table top
  const tw = document.querySelector('.table-wrapper');
  if (tw) tw.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function showSkeleton() {
  const tbody = document.getElementById('books-tbody');
  if (!tbody) return;
  tbody.innerHTML = Array.from({ length: 8 }, () => `
    <tr class="skeleton-row">
      <td><div class="skeleton-bar" style="width:60px"></div></td>
      <td><div class="skeleton-bar" style="width:180px"></div></td>
      <td><div class="skeleton-bar" style="width:130px"></div></td>
      <td><div class="skeleton-bar" style="width:50px"></div></td>
      <td><div class="skeleton-bar" style="width:110px"></div></td>
      <td><div class="skeleton-bar" style="width:140px"></div></td>
    </tr>`).join('');
}

// ─── Error State ──────────────────────────────────────────────────────────────
function showError(msg) {
  const tbody = document.getElementById('books-tbody');
  if (!tbody) return;
  tbody.innerHTML = `
    <tr><td colspan="6">
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <div class="empty-title">Error loading data</div>
        <div class="empty-sub">${escHtml(msg)}</div>
        <button class="btn-reset-empty" onclick="loadBooks()">Retry</button>
      </div>
    </td></tr>`;
}

// ─── Stats counter ───────────────────────────────────────────────────────────
function updateStats() {
  const total  = allBooks.length;
  const depts  = [...new Set(allBooks.map(b => b.Department))].length;
  const subjs  = [...new Set(allBooks.map(b => b.Subject))].length;

  const setEl = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  setEl('stat-total', total + '+ Books');
  setEl('stat-depts', depts + ' Departments');
  setEl('stat-subjs', subjs + ' Subjects');
}

// ─── Navbar scroll behaviour ──────────────────────────────────────────────────
function initNavbar() {
  const nav = document.getElementById('lib-navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  const hamburger = document.getElementById('lib-hamburger');
  const mobileMenu = document.getElementById('lib-nav-mobile');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });
  }
}

// ─── Page Size change ─────────────────────────────────────────────────────────
function handlePageSizeChange(val) {
  pageSize    = parseInt(val, 10) || CONFIG.defaultPageSize;
  currentPage = 1;
  renderTable();
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  loadBooks();
});
