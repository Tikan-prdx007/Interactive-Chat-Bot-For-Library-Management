/**
 * js/library-voice.js — SHELFBOT Library Voice Search
 *
 * Standalone voice search module for library.html.
 * Activates the Web Speech API and pipes the result into
 * the existing handleSearch() function from library-browse.js.
 *
 * Public API:
 *   LibraryVoice.toggle()   — start / stop listening
 *   LibraryVoice.init()     — attach mic button listeners (called on DOMContentLoaded)
 */

const LibraryVoice = (() => {
  'use strict';

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  let recognition = null;
  let listening    = false;

  /* ── UI helpers ────────────────────────────────────────────────────────────── */

  function _setBtn(state) {
    const btn    = document.getElementById('lib-voice-btn');
    const status = document.getElementById('lib-voice-status');
    if (!btn) return;

    btn.classList.remove('lv-idle', 'lv-listening', 'lv-error', 'lv-unsupported');

    if (state === 'listening') {
      btn.classList.add('lv-listening');
      btn.setAttribute('aria-label', 'Stop voice search');
      btn.title = 'Listening… click to stop';
      if (status) status.textContent = '🔴 Listening…';
    } else if (state === 'processing') {
      btn.classList.add('lv-listening');
      if (status) status.textContent = '⚙️ Processing…';
    } else if (state === 'error') {
      btn.classList.add('lv-error');
      btn.setAttribute('aria-label', 'Voice search (error)');
      if (status) status.textContent = '⚠️ Try again';
      setTimeout(() => _setBtn('idle'), 2500);
    } else if (state === 'unsupported') {
      btn.classList.add('lv-unsupported');
      btn.title = 'Voice search not supported in this browser';
      btn.setAttribute('aria-label', 'Voice search unavailable');
      if (status) status.textContent = 'Not supported';
    } else {
      // idle
      btn.classList.add('lv-idle');
      btn.setAttribute('aria-label', 'Voice search');
      btn.title = 'Click to search by voice';
      if (status) status.textContent = '';
    }
  }

  /* ── Core recognition logic ────────────────────────────────────────────────── */

  function _start() {
    if (!SpeechRecognition) { _setBtn('unsupported'); return; }

    recognition           = new SpeechRecognition();
    recognition.lang      = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      listening = true;
      _setBtn('listening');
    };

    recognition.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript?.trim() || '';
      if (!text) return;

      _setBtn('processing');

      // Feed into the library search box + trigger search
      const inp = document.getElementById('lib-search');
      if (inp) {
        inp.value = text;
        inp.dispatchEvent(new Event('input'));
      }

      // Call global handleSearch if available (library-browse.js)
      if (typeof handleSearch === 'function') {
        handleSearch(text);
      }

      setTimeout(() => _setBtn('idle'), 1200);
    };

    recognition.onerror = (e) => {
      console.warn('[LibraryVoice] error:', e.error);
      listening = false;
      _setBtn(e.error === 'not-allowed' ? 'error' : 'error');
    };

    recognition.onend = () => {
      listening = false;
      if (document.querySelector('#lib-voice-btn.lv-listening')) {
        _setBtn('idle');
      }
    };

    try {
      recognition.start();
    } catch (err) {
      console.warn('[LibraryVoice] start failed:', err);
      _setBtn('error');
    }
  }

  function _stop() {
    if (recognition) { try { recognition.stop(); } catch (_) {} recognition = null; }
    listening = false;
    _setBtn('idle');
  }

  /* ── Public ─────────────────────────────────────────────────────────────────── */

  function toggle() {
    if (!SpeechRecognition) { _setBtn('unsupported'); return; }
    if (listening) { _stop(); } else { _start(); }
  }

  function init() {
    const btn = document.getElementById('lib-voice-btn');
    if (!btn) return;

    if (!SpeechRecognition) {
      _setBtn('unsupported');
      return;
    }

    btn.addEventListener('click', toggle);
    _setBtn('idle');
  }

  return { toggle, init };
})();

/* ── Inject CSS for the voice button ─────────────────────────────────────────── */
(function _injectLibVoiceCSS() {
  if (document.getElementById('lib-voice-css')) return;
  const s = document.createElement('style');
  s.id = 'lib-voice-css';
  s.textContent = `
/* ── Library Voice Button ────────────────────── */
.lib-voice-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}
#lib-voice-btn {
  width: 40px; height: 40px;
  border-radius: 50%;
  border: 1.5px solid var(--border, rgba(255,255,255,.1));
  background: var(--bg-glass, rgba(255,255,255,.04));
  color: var(--text-secondary, #9CA3AF);
  font-size: 1.1rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .2s;
  flex-shrink: 0;
}
#lib-voice-btn.lv-idle:hover {
  border-color: var(--accent-primary, #8B5CF6);
  color: var(--accent-primary, #8B5CF6);
  background: rgba(139,92,246,.08);
}
#lib-voice-btn.lv-listening {
  border-color: #F87171;
  color: #F87171;
  background: rgba(248,113,113,.1);
  animation: lvPulse 1s ease infinite;
}
#lib-voice-btn.lv-error {
  border-color: #F87171;
  color: #F87171;
}
#lib-voice-btn.lv-unsupported {
  opacity: .4;
  cursor: not-allowed;
}
@keyframes lvPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(248,113,113,.4); }
  50%       { box-shadow: 0 0 0 8px rgba(248,113,113,0); }
}
#lib-voice-status {
  font-size: .72rem;
  color: var(--text-muted, #6B7280);
  min-width: 72px;
  white-space: nowrap;
}
`;
  document.head.appendChild(s);
})();

document.addEventListener('DOMContentLoaded', () => LibraryVoice.init());
