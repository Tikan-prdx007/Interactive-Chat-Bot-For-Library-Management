// ─── Library Module (BPUT Edition) ───────────────────────────────────────────

const LibraryModule = (() => {

  let currentResults = [];
  let activeFilter = { branch: "", year: 0, avail: "all" };

  // ── Main Render ─────────────────────────────────────────────────────────────
  function render() {
    const panel = document.getElementById("panel-library");
    const total = BPUT_BOOKS_FLAT.length;
    const avail = BPUT_BOOKS_FLAT.filter(b => b.available).length;
    const issued = total - avail;

    panel.innerHTML = `
      <div class="panel-header">
        <h2>📚 BPUT Library Catalogue</h2>
        <p class="panel-sub">Biju Patnaik University of Technology — All Branches · All Years</p>
      </div>

      <!-- Stats Bar -->
      <div class="book-stats-bar">
        <span class="stat-chip green">✅ ${avail} Available</span>
        <span class="stat-chip red">⏳ ${issued} Issued</span>
        <span class="stat-chip blue">📦 ${total} Books</span>
        <span class="stat-chip purple">🏫 ${BPUT_CURRICULUM.length} Subjects</span>
      </div>

      <!-- Search -->
      <div class="search-bar-wrap">
        <input type="text" id="lib-search" class="search-input"
               placeholder="🔍  Search title, author, subject, branch..."
               oninput="LibraryModule.search(this.value)" autocomplete="off"/>
      </div>

      <!-- Smart Filters -->
      <div class="lib-filter-bar">
        <div class="lib-filter-group">
          <label class="lib-filter-label">🏛️ Branch</label>
          <div class="filter-chips" id="branch-chips">
            <span class="chip active" onclick="LibraryModule.setBranch('',this)">All</span>
            ${BPUT_BRANCHES.map(b => `<span class="chip" onclick="LibraryModule.setBranch('${b}',this)">${_branchEmoji(b)} ${b}</span>`).join("")}
          </div>
        </div>
        <div class="lib-filter-group" id="year-filter-group" style="display:none">
          <label class="lib-filter-label">📅 Year</label>
          <div class="filter-chips" id="year-chips"></div>
        </div>
        <div class="lib-filter-group">
          <label class="lib-filter-label">📋 Availability</label>
          <div class="filter-chips">
            <span class="chip active" onclick="LibraryModule.setAvail('all',this)">All</span>
            <span class="chip" onclick="LibraryModule.setAvail('avail',this)">✅ Available</span>
            <span class="chip" onclick="LibraryModule.setAvail('issued',this)">⏳ Issued</span>
          </div>
        </div>
      </div>

      <!-- Subjects Accordion (shown when branch selected) -->
      <div id="subjects-panel"></div>

      <!-- Book Grid -->
      <div id="book-grid" class="book-grid"></div>`;

    currentResults = [...BPUT_BOOKS_FLAT];
    renderBooks(currentResults);
  }

  function _branchEmoji(b) {
    return { CSE: "💻", ECE: "📡", EE: "⚡", Civil: "🏗️", Mechanical: "⚙️" }[b] || "📖";
  }

  // ── Filters ─────────────────────────────────────────────────────────────────
  function setBranch(branch, chip) {
    _setActiveChip("branch-chips", chip);
    activeFilter.branch = branch;
    activeFilter.year = 0;
    document.getElementById("lib-search").value = "";

    // Show/hide year filter
    const yg = document.getElementById("year-filter-group");
    if (branch) {
      yg.style.display = "";
      const years = [...new Set(BPUT_CURRICULUM.filter(s => s.branch === branch).map(s => s.year))].sort();
      const yc = document.getElementById("year-chips");
      yc.innerHTML = `<span class="chip active" onclick="LibraryModule.setYear(0,this)">All Years</span>` +
        years.map(y => `<span class="chip" onclick="LibraryModule.setYear(${y},this)">Year ${y}</span>`).join("");
    } else {
      yg.style.display = "none";
    }
    _applyFilters();
    _renderSubjectsPanel();
  }

  function setYear(year, chip) {
    _setActiveChip("year-chips", chip);
    activeFilter.year = year;
    _applyFilters();
    _renderSubjectsPanel();
  }

  function setAvail(mode, chip) {
    // find correct chip group
    chip.closest(".filter-chips").querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    activeFilter.avail = mode;
    _applyFilters();
  }

  function _setActiveChip(containerId, chip) {
    const c = document.getElementById(containerId);
    if (c) c.querySelectorAll(".chip").forEach(x => x.classList.remove("active"));
    chip.classList.add("active");
  }

  function _applyFilters() {
    let results = [...BPUT_BOOKS_FLAT];
    if (activeFilter.branch) results = results.filter(b => b.branch === activeFilter.branch);
    if (activeFilter.year) results = results.filter(b => b.year === activeFilter.year);
    if (activeFilter.avail === "avail") results = results.filter(b => b.available);
    if (activeFilter.avail === "issued") results = results.filter(b => !b.available);
    currentResults = results;
    renderBooks(results);
  }

  // ── Subjects Accordion ──────────────────────────────────────────────────────
  function _renderSubjectsPanel() {
    const container = document.getElementById("subjects-panel");
    if (!container) return;
    if (!activeFilter.branch) { container.innerHTML = ""; return; }
    const subjects = activeFilter.year
      ? getYearSubjects(activeFilter.branch, activeFilter.year)
      : getBranchSubjects(activeFilter.branch);

    if (!subjects.length) { container.innerHTML = ""; return; }
    container.innerHTML = `
      <div class="subjects-accordion">
        <div class="subj-header">
          📘 Subjects — ${activeFilter.branch}
          ${activeFilter.year ? `Year ${activeFilter.year}` : "(All Years)"}
        </div>
        <div class="subj-grid">
          ${subjects.map(s => `
            <div class="subj-chip" onclick="LibraryModule.filterBySubject('${s.subjectName}')">
              <span class="subj-code">${s.subjectCode}</span>
              <span class="subj-name">${s.subjectName}</span>
              <span class="subj-meta">Sem ${s.semester} · ${s.credits}</span>
            </div>`).join("")}
        </div>
      </div>`;
  }

  function filterBySubject(subjectName) {
    document.getElementById("lib-search").value = subjectName;
    search(subjectName);
  }

  // ── Search ──────────────────────────────────────────────────────────────────
  function search(q) {
    const term = q.toLowerCase().trim();
    if (!term) { _applyFilters(); return; }
    let pool = activeFilter.branch
      ? BPUT_BOOKS_FLAT.filter(b => b.branch === activeFilter.branch)
      : BPUT_BOOKS_FLAT;
    if (activeFilter.year) pool = pool.filter(b => b.year === activeFilter.year);

    const results = pool.filter(b =>
      b.title.toLowerCase().includes(term) ||
      b.author.toLowerCase().includes(term) ||
      b.subject.toLowerCase().includes(term) ||
      b.publisher.toLowerCase().includes(term) ||
      b.branch.toLowerCase().includes(term) ||
      b.subjectCode.toLowerCase().includes(term)
    );
    currentResults = results;
    renderBooks(results, q);
  }

  // ── Book Grid ───────────────────────────────────────────────────────────────
  function renderBooks(books, highlight = "") {
    const grid = document.getElementById("book-grid");
    if (!books.length) {
      grid.innerHTML = `<div class="no-results">
        <div class="no-results-icon">🔍</div>
        <p>No books found. Try a different filter or search term.</p>
        <div class="suggestion-list">
          ${BPUT_BOOKS_FLAT.slice(0, 3).map(b => `
            <span class="suggestion-chip"
                  onclick="document.getElementById('lib-search').value='${b.title}';LibraryModule.search('${b.title}')">
              ${b.emoji} ${b.title}
            </span>`).join("")}
        </div>
      </div>`;
      return;
    }
    grid.innerHTML = books.map(b => renderBookCard(b)).join("");
  }

  function renderBookCard(book) {
    const state = AppState.student;
    const isIssued = state.issuedBooks && state.issuedBooks.includes(book.id);
    const badge = isIssued
      ? `<span class="avail-badge reserved">📌 Reserved by You</span>`
      : book.available
        ? `<span class="avail-badge available">✅ ${book.availableCopies}/${book.totalCopies} Available</span>`
        : `<span class="avail-badge unavailable">⏳ All Copies Issued</span>`;
    const btn = isIssued
      ? `<button class="btn btn-return" onclick="LibraryModule.returnBook('${book.id}')">↩ Return</button>`
      : book.available
        ? `<button class="btn btn-reserve" onclick="LibraryModule.reserveBook('${book.id}')">📌 Reserve</button>`
        : `<button class="btn btn-ghost" disabled>Not Available</button>`;
    return `
      <div class="book-card" id="book-${book.id}">
        <div class="book-emoji">${book.emoji}</div>
        <div class="book-info">
          <div class="book-title">${book.title}</div>
          <div class="book-author">✍️ ${book.author} · ${book.publisher} · ${book.edition} Ed.</div>
          <div class="book-meta">
            <span class="tag">${book.subjectName}</span>
            <span class="tag tag-branch">${book.branch} · Y${book.year}</span>
            <span class="shelf-tag">🗄 ${book.rack}</span>
          </div>
          <div class="book-meta">
            <span class="tag tag-type">${book.type}</span>
            <span class="isbn-tag">ISBN: ${book.ISBN}</span>
          </div>
          ${badge}
          <div class="book-actions">${btn}</div>
        </div>
      </div>`;
  }

  // ── Reserve / Return ────────────────────────────────────────────────────────
  function reserveBook(id) {
    const book = BPUT_BOOKS_FLAT.find(b => b.id === id);
    if (!book || !book.available) return;
    if (!AppState.student.issuedBooks) AppState.student.issuedBooks = [];
    AppState.student.issuedBooks.push(id);
    book.availableCopies = Math.max(0, book.availableCopies - 1);
    book.available = book.availableCopies > 0;
    AppState.save();
    Gamification.checkAndAwardBadge("bookworm");
    Gamification.awardXP(10);
    const due = new Date(); due.setDate(due.getDate() + 14);
    if (typeof Settings !== "undefined") Settings.notify(`📚 "${book.title}" reserved! Due: ${due.toDateString()}`);
    Gamification.showToast(`📚 "${book.title}" reserved! Return by ${due.toDateString()}.`, "success");
    renderBooks(currentResults);
  }

  function returnBook(id) {
    const book = BPUT_BOOKS_FLAT.find(b => b.id === id);
    if (!book) return;
    AppState.student.issuedBooks = (AppState.student.issuedBooks || []).filter(i => i !== id);
    book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
    book.available = true;
    AppState.save();
    Gamification.awardXP(5);
    if (typeof Settings !== "undefined") Settings.notify(`✅ "${book.title}" returned successfully.`);
    Gamification.showToast(`✅ "${book.title}" returned. Thank you!`, "info");
    renderBooks(currentResults);
  }

  return { render, search, setBranch, setYear, setAvail, filterBySubject, reserveBook, returnBook };
})();
