/**
 * js/barcode.js — SHELFBOT Library Barcode Module
 *
 * ▸ Barcode generation (JsBarcode — CODE128)
 * ▸ Camera scanning   (html5-qrcode)
 * ▸ ISBN book search + result display
 */

const BarcodeModule = (() => {
  'use strict';

  let scanner = null;          // Html5Qrcode instance
  let isScanning = false;

  /* ── Inject CSS (once) ──────────────────────────────────────────────────── */
  function _injectCSS() {
    if (document.getElementById('barcode-css')) return;
    const s = document.createElement('style');
    s.id = 'barcode-css';
    s.textContent = `

/* ═══ Scan Book Button ═══════════════════════════════════════════════════ */
.lib-scan-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px;
  border-radius: 12px;
  border: 1.5px solid var(--accent-primary);
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-primary2, #7c3aed));
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: .85rem; font-weight: 700;
  cursor: pointer;
  transition: transform .18s, box-shadow .18s, opacity .18s;
  white-space: nowrap;
  box-shadow: 0 2px 12px rgba(139,92,246,.35);
}
.lib-scan-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(139,92,246,.5);
}
.lib-scan-btn .scan-icon { font-size: 1.1rem; }

/* ═══ Barcode Cell ═══════════════════════════════════════════════════════ */
.lib-barcode-cell {
  min-width: 120px;
  padding: 4px 0;
}
.lib-barcode-cell svg {
  display: block;
  max-width: 130px;
  height: 40px;
}
.lib-barcode-isbn {
  font-size: .6rem;
  color: var(--text-muted);
  font-family: 'Inter', monospace;
  margin-top: 2px;
  letter-spacing: .03em;
}

/* ═══ Scanner Modal ═════════════════════════════════════════════════════ */
.bc-overlay {
  position: fixed; inset: 0;
  z-index: 9999;
  background: rgba(5,8,22,.88);
  backdrop-filter: blur(10px);
  display: flex; align-items: center; justify-content: center;
  animation: bcFadeIn .28s ease;
  overflow-y: auto;
  padding: 20px;
}
@keyframes bcFadeIn { from { opacity: 0; } to { opacity: 1; } }

.bc-modal {
  width: 100%; max-width: 520px;
  background: var(--bg-card, #131A2E);
  border: 1px solid var(--border, rgba(255,255,255,.08));
  border-radius: 20px;
  box-shadow: 0 24px 64px rgba(0,0,0,.5);
  overflow: hidden;
  animation: bcSlideUp .32s ease;
}
@keyframes bcSlideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

/* Modal header */
.bc-modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid var(--border, rgba(255,255,255,.08));
}
.bc-modal-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.15rem; font-weight: 700;
  color: var(--text-primary, #E5E7EB);
  display: flex; align-items: center; gap: 8px;
}
.bc-close-btn {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border, rgba(255,255,255,.08));
  background: var(--bg-glass, rgba(255,255,255,.04));
  color: var(--text-muted, #6B7280);
  font-size: 1.1rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .18s;
}
.bc-close-btn:hover {
  background: rgba(248,113,113,.15);
  color: var(--accent-coral, #F87171);
  border-color: var(--accent-coral, #F87171);
}

/* Camera viewport */
.bc-camera-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  background: #0a0e1a;
  overflow: hidden;
}
.bc-camera-wrap video { width: 100%; height: 100%; object-fit: cover; }
.bc-scan-guide {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none;
}
.bc-scan-frame {
  width: 70%; height: 50%;
  border: 2px dashed rgba(139,92,246,.6);
  border-radius: 12px;
  position: relative;
}
.bc-scan-line {
  position: absolute; left: 4%; right: 4%; top: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent-primary, #8B5CF6), transparent);
  animation: bcScanLine 2s ease-in-out infinite;
  box-shadow: 0 0 12px rgba(139,92,246,.5);
}
@keyframes bcScanLine { 0%,100% { top: 10%; } 50% { top: 85%; } }

.bc-camera-hint {
  text-align: center;
  padding: 12px 20px;
  font-size: .82rem;
  color: var(--text-muted, #6B7280);
  border-top: 1px solid var(--border, rgba(255,255,255,.08));
}

/* Loading state */
.bc-loading {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px;
  padding: 40px 20px;
}
.bc-spinner {
  width: 40px; height: 40px;
  border: 3px solid var(--border, rgba(255,255,255,.1));
  border-top-color: var(--accent-primary, #8B5CF6);
  border-radius: 50%;
  animation: bcSpin .7s linear infinite;
}
@keyframes bcSpin { to { transform: rotate(360deg); } }
.bc-loading-text {
  font-size: .85rem;
  color: var(--text-secondary, #9CA3AF);
}

/* ═══ Result Card ══════════════════════════════════════════════════════ */
.bc-result {
  padding: 22px;
}
.bc-result-status {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: .85rem; font-weight: 700;
  margin-bottom: 16px;
}
.bc-result-status.success {
  background: rgba(34,197,94,.12);
  color: #22C55E;
  border: 1px solid rgba(34,197,94,.25);
}
.bc-result-status.error {
  background: rgba(248,113,113,.12);
  color: #F87171;
  border: 1px solid rgba(248,113,113,.25);
}

.bc-book-card {
  background: var(--bg-glass, rgba(255,255,255,.04));
  border: 1px solid var(--border, rgba(255,255,255,.08));
  border-radius: 14px;
  padding: 18px;
}
.bc-book-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.05rem; font-weight: 700;
  color: var(--text-primary, #E5E7EB);
  margin-bottom: 4px;
}
.bc-book-author {
  font-size: .84rem;
  color: var(--text-secondary, #9CA3AF);
  margin-bottom: 12px;
}
.bc-book-meta {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
}
.bc-meta-item {
  display: flex; align-items: center; gap: 6px;
  font-size: .78rem;
  color: var(--text-muted, #6B7280);
  padding: 6px 10px;
  background: var(--bg-card, #131A2E);
  border-radius: 8px;
  border: 1px solid var(--border, rgba(255,255,255,.06));
}
.bc-meta-item .mi-label { font-weight: 600; color: var(--text-secondary, #9CA3AF); }
.bc-meta-item .mi-value { color: var(--text-primary, #E5E7EB); font-weight: 700; }

.bc-book-actions {
  display: flex; gap: 8px; flex-wrap: wrap;
}
.bc-act-btn {
  flex: 1; min-width: 100px;
  padding: 10px 14px;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: .82rem; font-weight: 700;
  cursor: pointer;
  text-align: center;
  transition: all .18s;
  border: none;
}
.bc-act-primary {
  background: linear-gradient(135deg, var(--accent-primary, #8B5CF6), var(--accent-primary2, #7c3aed));
  color: #fff;
  box-shadow: 0 2px 10px rgba(139,92,246,.35);
}
.bc-act-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(139,92,246,.5); }
.bc-act-secondary {
  background: var(--bg-glass, rgba(255,255,255,.04));
  color: var(--text-secondary, #9CA3AF);
  border: 1px solid var(--border, rgba(255,255,255,.08));
}
.bc-act-secondary:hover { border-color: var(--accent-primary, #8B5CF6); color: var(--accent-primary, #8B5CF6); }
.bc-act-success {
  background: rgba(34,197,94,.12);
  color: #22C55E;
  border: 1px solid rgba(34,197,94,.25);
}
.bc-act-success:hover { background: rgba(34,197,94,.2); }
.bc-act-disabled {
  background: var(--bg-glass, rgba(255,255,255,.04));
  color: var(--text-muted, #6B7280);
  cursor: default;
  border: 1px solid var(--border, rgba(255,255,255,.06));
}

/* New-scan footer */
.bc-modal-foot {
  padding: 14px 22px;
  border-top: 1px solid var(--border, rgba(255,255,255,.08));
  display: flex; justify-content: center;
}
.bc-scan-again {
  padding: 10px 22px;
  border-radius: 10px;
  border: 1.5px solid var(--accent-primary, #8B5CF6);
  background: transparent;
  color: var(--accent-primary, #8B5CF6);
  font-family: 'Inter', sans-serif;
  font-size: .82rem; font-weight: 700;
  cursor: pointer;
  transition: all .18s;
}
.bc-scan-again:hover {
  background: var(--accent-primary, #8B5CF6);
  color: #fff;
}

/* ═══ Print Barcode ═══════════════════════════════════════════════════ */
.bc-print-btn {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid var(--border, rgba(255,255,255,.08));
  background: transparent;
  color: var(--text-muted, #6B7280);
  font-size: .68rem; font-weight: 600;
  cursor: pointer;
  margin-top: 4px;
  transition: all .18s;
}
.bc-print-btn:hover {
  border-color: var(--accent-primary, #8B5CF6);
  color: var(--accent-primary, #8B5CF6);
}

@media print {
  .bc-overlay { display: none !important; }
}
    `;
    document.head.appendChild(s);
  }

  /* ── Escape helper ──────────────────────────────────────────────────── */
  function _e(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ══════════════════════════════════════════════════════════════════════
     FEATURE 1 — Barcode Generation
  ══════════════════════════════════════════════════════════════════════ */

  /**
   * Render CODE128 barcode SVGs for all visible rows.
   * Called after `_renderRows()` in library.js.
   */
  function renderBarcodes() {
    if (typeof JsBarcode === 'undefined') {
      console.warn('JsBarcode not loaded — barcodes skipped');
      return;
    }
    document.querySelectorAll('.lib-barcode-svg').forEach(el => {
      const isbn = el.dataset.isbn;
      if (!isbn) return;
      // Strip hyphens for the barcode value
      const code = isbn.replace(/-/g, '');
      try {
        JsBarcode(el, code, {
          format: 'CODE128',
          width: 1.1,
          height: 32,
          displayValue: false,
          background: 'transparent',
          lineColor: getComputedStyle(document.documentElement)
            .getPropertyValue('--text-secondary')?.trim() || '#9CA3AF',
          margin: 0,
        });
      } catch (e) {
        console.warn('Barcode error for', isbn, e);
      }
    });
  }

  /**
   * Return HTML for the barcode table cell.
   */
  function barcodeCellHTML(isbn) {
    if (!isbn) return '<span class="lib-barcode-isbn">—</span>';
    const shortISBN = isbn.replace(/-/g, '');
    return `
      <div class="lib-barcode-cell">
        <svg class="lib-barcode-svg" data-isbn="${_e(isbn)}"></svg>
        <div class="lib-barcode-isbn">${_e(isbn)}</div>
        <button class="bc-print-btn" onclick="BarcodeModule.printBarcode('${_e(isbn)}')" title="Print barcode">🖨️ Print</button>
      </div>`;
  }

  /**
   * Print a single barcode.
   */
  function printBarcode(isbn) {
    const code = isbn.replace(/-/g, '');
    const win = window.open('', '_blank', 'width=400,height=300');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Barcode — ${_e(isbn)}</title>
      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
      <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:monospace;}</style>
    </head><body>
      <svg id="bc"></svg>
      <p style="margin-top:8px;font-size:13px;">${_e(isbn)}</p>
      <script>
        JsBarcode("#bc","${code}",{format:"CODE128",width:2,height:60,displayValue:true,margin:10});
        setTimeout(()=>{window.print();},400);
      <\/script>
    </body></html>`);
    win.document.close();
  }


  /* ══════════════════════════════════════════════════════════════════════
     FEATURE 2+3 — Scanner Modal + Camera Scanning
  ══════════════════════════════════════════════════════════════════════ */

  function openScanner() {
    _injectCSS();
    _closeScanner();          // clean any previous modal

    const overlay = document.createElement('div');
    overlay.className = 'bc-overlay';
    overlay.id = 'bc-overlay';

    overlay.innerHTML = `
      <div class="bc-modal" id="bc-modal">
        <!-- Header -->
        <div class="bc-modal-head">
          <div class="bc-modal-title">📷 Scan Book Barcode</div>
          <button class="bc-close-btn" onclick="BarcodeModule.closeScanner()" title="Close">✕</button>
        </div>
        <!-- Camera viewport -->
        <div class="bc-camera-wrap" id="bc-camera">
          <div class="bc-scan-guide">
            <div class="bc-scan-frame"><div class="bc-scan-line"></div></div>
          </div>
        </div>
        <div class="bc-camera-hint">Align the book's barcode within the frame. Scanning is automatic.</div>
        <!-- Result (populated later) -->
        <div id="bc-result-area"></div>
      </div>`;

    document.body.appendChild(overlay);

    // close on overlay click (outside modal)
    overlay.addEventListener('click', e => {
      if (e.target === overlay) BarcodeModule.closeScanner();
    });

    // close on Escape
    const escHandler = e => {
      if (e.key === 'Escape') BarcodeModule.closeScanner();
    };
    document.addEventListener('keydown', escHandler, { once: true });

    _startCamera();
  }

  async function _startCamera() {
    if (typeof Html5Qrcode === 'undefined') {
      _showResult(null, 'html5-qrcode library not loaded. Please check your internet connection.');
      return;
    }

    const cameraEl = document.getElementById('bc-camera');
    if (!cameraEl) return;

    try {
      scanner = new Html5Qrcode('bc-camera');
      isScanning = true;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: function (viewfinderWidth, viewfinderHeight) {
            const w = Math.floor(viewfinderWidth * 0.7);
            const h = Math.floor(viewfinderHeight * 0.45);
            return { width: Math.max(200, w), height: Math.max(100, h) };
          },
          aspectRatio: 4 / 3,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
          ],
        },
        _onDecode,
        () => {}          // ignore scanning errors (no barcode in frame)
      );
    } catch (err) {
      console.error('Camera error:', err);
      _showCameraError(err);
    }
  }

  /**
   * Show a proper camera error with troubleshooting + manual ISBN fallback.
   */
  function _showCameraError(err) {
    const cam = document.getElementById('bc-camera');
    const hint = cam?.nextElementSibling;
    if (cam) cam.style.display = 'none';
    if (hint && hint.classList?.contains('bc-camera-hint')) hint.style.display = 'none';

    const area = document.getElementById('bc-result-area');
    if (!area) return;

    const isHTTPS = location.protocol === 'https:';
    const isLocalhost = location.hostname === 'localhost';
    const isPermissionErr = String(err).includes('NotAllowed') || String(err).includes('Permission');

    area.innerHTML = `
      <div class="bc-result">
        <div class="bc-result-status error">⚠️ Camera Unavailable</div>
        <div class="bc-book-card" style="padding:20px;">
          <div style="font-size:2rem;text-align:center;margin-bottom:10px;">📷🚫</div>
          <div style="font-size:.9rem;font-weight:600;color:var(--text-primary,#E5E7EB);margin-bottom:12px;text-align:center;">
            ${isPermissionErr ? 'Camera permission was denied' : 'Could not access camera'}
          </div>
          <div style="font-size:.78rem;color:var(--text-muted,#6B7280);line-height:1.6;">
            <strong style="color:var(--text-secondary,#9CA3AF);">Fix this by:</strong>
            <ol style="margin:8px 0 0 16px;padding:0;">
              ${!isHTTPS && !isLocalhost ? '<li>Use <strong>localhost</strong> instead of 127.0.0.1 in the URL bar<br><code style="background:rgba(139,92,246,.15);padding:2px 6px;border-radius:4px;font-size:.75rem;">http://localhost:5504/index.html</code></li>' : ''}
              <li>Click the 🔒 lock/info icon in the address bar → Allow camera</li>
              <li>Check <strong>Windows Settings → Privacy → Camera</strong> is enabled for your browser</li>
              <li>Try a different browser (Chrome works best)</li>
            </ol>
          </div>

          <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border,rgba(255,255,255,.08));">
            <div style="font-size:.82rem;font-weight:700;color:var(--text-secondary,#9CA3AF);margin-bottom:8px;">
              📝 Or enter ISBN manually:
            </div>
            <div style="display:flex;gap:8px;">
              <input type="text" id="bc-manual-isbn" placeholder="e.g. 978-0-13-110362-7"
                style="flex:1;padding:10px 14px;border-radius:10px;border:1px solid var(--border,rgba(255,255,255,.12));
                background:var(--bg-glass,rgba(255,255,255,.04));color:var(--text-primary,#E5E7EB);
                font-family:'Inter',monospace;font-size:.85rem;outline:none;"
                onkeydown="if(event.key==='Enter')BarcodeModule._manualISBNSubmit()">
              <button class="bc-act-btn bc-act-primary" style="flex:none;min-width:auto;padding:10px 18px;"
                onclick="BarcodeModule._manualISBNSubmit()">Search</button>
            </div>
          </div>
        </div>
      </div>
      <div class="bc-modal-foot">
        <button class="bc-scan-again" onclick="BarcodeModule._rescan()">🔄 Try Camera Again</button>
      </div>`;

    // Auto-focus the input
    setTimeout(() => document.getElementById('bc-manual-isbn')?.focus(), 100);
  }

  async function _stopCamera() {
    if (scanner && isScanning) {
      try { await scanner.stop(); } catch (e) { /* ignore */ }
      isScanning = false;
    }
  }

  /**
   * Called when a barcode is decoded.
   */
  async function _onDecode(decodedText) {
    await _stopCamera();
    // Hide the camera + hint
    const cam = document.getElementById('bc-camera');
    const hint = cam?.nextElementSibling;
    if (cam) cam.style.display = 'none';
    if (hint && hint.classList?.contains('bc-camera-hint')) hint.style.display = 'none';

    _showLoading();

    // Simulate a tiny search delay for UX feedback
    await new Promise(r => setTimeout(r, 600));

    const book = _searchByISBN(decodedText.trim());
    _showResult(book, decodedText.trim());
  }

  /* ── ISBN Search ────────────────────────────────────────────────────── */

  function _searchByISBN(raw) {
    const clean = raw.replace(/-/g, '');
    return BPUT_BOOKS_FLAT.find(b => {
      const bISBN = (b.ISBN || '').replace(/-/g, '');
      return bISBN === clean || b.id === clean;
    }) || null;
  }

  /* ── Loading state ──────────────────────────────────────────────────── */

  function _showLoading() {
    const area = document.getElementById('bc-result-area');
    if (!area) return;
    area.innerHTML = `
      <div class="bc-loading">
        <div class="bc-spinner"></div>
        <div class="bc-loading-text">Searching library database…</div>
      </div>`;
  }

  /* ── Result display ─────────────────────────────────────────────────── */

  function _showResult(book, scannedValue) {
    const area = document.getElementById('bc-result-area');
    if (!area) return;

    if (book) {
      // ✅ Book found
      const issuedIds = (typeof AppState !== 'undefined' && AppState.student?.issuedBooks) || [];
      const mine = issuedIds.includes(book.id);
      const availText = book.available
        ? `${book.availableCopies} / ${book.totalCopies}`
        : '0 / ' + book.totalCopies;
      const availColor = book.available ? '#22C55E' : '#F87171';

      let actionBtns = '';
      if (mine) {
        actionBtns = `<button class="bc-act-btn bc-act-success" onclick="LibraryModule.returnBook('${_e(book.id)}');BarcodeModule.closeScanner();">↩ Return Book</button>`;
      } else if (book.available) {
        actionBtns = `<button class="bc-act-btn bc-act-primary" onclick="LibraryModule.reserveBook('${_e(book.id)}');BarcodeModule.closeScanner();">📌 Reserve Book</button>`;
      } else {
        actionBtns = `<button class="bc-act-btn bc-act-disabled" disabled>Unavailable</button>`;
      }

      area.innerHTML = `
        <div class="bc-result">
          <div class="bc-result-status success">✅ Book Found!</div>
          <div class="bc-book-card">
            <div class="bc-book-title">${_e(book.title)}</div>
            <div class="bc-book-author">by ${_e(book.author)}</div>
            <div class="bc-book-meta">
              <div class="bc-meta-item">
                <span class="mi-label">ISBN</span>
                <span class="mi-value">${_e(book.ISBN)}</span>
              </div>
              <div class="bc-meta-item">
                <span class="mi-label">Copies</span>
                <span class="mi-value" style="color:${availColor}">${availText}</span>
              </div>
              <div class="bc-meta-item">
                <span class="mi-label">Branch</span>
                <span class="mi-value">${_e(book.branch)}</span>
              </div>
              <div class="bc-meta-item">
                <span class="mi-label">Subject</span>
                <span class="mi-value">${_e(book.subjectName)}</span>
              </div>
              <div class="bc-meta-item">
                <span class="mi-label">Rack</span>
                <span class="mi-value">${_e(book.shelf || book.rack)}</span>
              </div>
              <div class="bc-meta-item">
                <span class="mi-label">Type</span>
                <span class="mi-value">${_e(book.type)}</span>
              </div>
            </div>
            <div class="bc-book-actions">
              ${actionBtns}
              <button class="bc-act-btn bc-act-secondary" onclick="BarcodeModule.closeScanner();BarcodeModule.scrollToBook('${_e(book.ISBN)}');">👁️ View in Library</button>
            </div>
          </div>
        </div>
        <div class="bc-modal-foot">
          <button class="bc-scan-again" onclick="BarcodeModule._rescan()">📷 Scan Another Book</button>
        </div>`;
    } else {
      // ❌ Not found
      area.innerHTML = `
        <div class="bc-result">
          <div class="bc-result-status error">❌ Book Not Found</div>
          <div class="bc-book-card" style="text-align:center;padding:24px;">
            <div style="font-size:2.5rem;margin-bottom:8px;">🔍</div>
            <div style="font-size:.95rem;font-weight:600;color:var(--text-primary,#E5E7EB);margin-bottom:4px;">
              No matching book in the SHELFBOT database
            </div>
            <div style="font-size:.82rem;color:var(--text-muted,#6B7280);margin-bottom:4px;">
              Scanned value: <code style="background:rgba(255,255,255,.06);padding:2px 8px;border-radius:4px;">${_e(scannedValue)}</code>
            </div>
            <div style="font-size:.76rem;color:var(--text-muted,#6B7280);">
              This barcode may belong to a book not yet catalogued in our library.
            </div>
          </div>
        </div>
        <div class="bc-modal-foot">
          <button class="bc-scan-again" onclick="BarcodeModule._rescan()">📷 Scan Another Book</button>
        </div>`;
    }
  }

  /* ── Re-scan (show camera again) ────────────────────────────────────── */

  function _rescan() {
    const area = document.getElementById('bc-result-area');
    if (area) area.innerHTML = '';
    const cam = document.getElementById('bc-camera');
    const hint = cam?.nextElementSibling;
    if (cam) cam.style.display = '';
    if (hint && hint.classList?.contains('bc-camera-hint')) hint.style.display = '';
    _startCamera();
  }

  /* ── Close scanner ──────────────────────────────────────────────────── */

  function _closeScanner() {
    _stopCamera();
    const overlay = document.getElementById('bc-overlay');
    if (overlay) overlay.remove();
    scanner = null;
  }

  /* ── Scroll to book in library ──────────────────────────────────────── */

  function scrollToBook(isbn) {
    // Navigate to library panel
    if (typeof App !== 'undefined') App.navigate('library');
    // Search for the ISBN
    setTimeout(() => {
      if (typeof LibraryModule !== 'undefined') {
        LibraryModule._onSearch(isbn);
        const input = document.getElementById('lib-q');
        if (input) input.value = isbn;
      }
    }, 200);
  }

  /* ── Manual ISBN entry (fallback) ───────────────────────────────────── */

  function manualSearch() {
    const isbn = prompt('Enter ISBN or barcode number:');
    if (!isbn) return;
    _injectCSS();
    // Create a mini overlay
    const overlay = document.createElement('div');
    overlay.className = 'bc-overlay';
    overlay.id = 'bc-overlay';
    overlay.innerHTML = `
      <div class="bc-modal" id="bc-modal">
        <div class="bc-modal-head">
          <div class="bc-modal-title">🔍 ISBN Lookup</div>
          <button class="bc-close-btn" onclick="BarcodeModule.closeScanner()" title="Close">✕</button>
        </div>
        <div id="bc-result-area"></div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => {
      if (e.target === overlay) _closeScanner();
    });

    _showLoading();
    setTimeout(() => {
      const book = _searchByISBN(isbn.trim());
      _showResult(book, isbn.trim());
    }, 500);
  }

  /* ── Manual ISBN submit from inline input ─────────────────────────────── */

  function _manualISBNSubmit() {
    const input = document.getElementById('bc-manual-isbn');
    const isbn = input?.value?.trim();
    if (!isbn) { input?.focus(); return; }

    _showLoading();
    setTimeout(() => {
      const book = _searchByISBN(isbn);
      _showResult(book, isbn);
    }, 500);
  }

  /* ── Init ────────────────────────────────────────────────────────────── */

  function init() {
    _injectCSS();
  }

  /* ── Public API ─────────────────────────────────────────────────────── */
  return {
    init,
    renderBarcodes,
    barcodeCellHTML,
    printBarcode,
    openScanner,
    closeScanner: _closeScanner,
    scrollToBook,
    manualSearch,
    _rescan,
    _manualISBNSubmit,
  };

})();
