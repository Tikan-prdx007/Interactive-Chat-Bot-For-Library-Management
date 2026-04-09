// ─── SpeechRecognitionModule — Clean mic input module ─────────────────────────
// Extracted from AssistantModule for reuse across the app.
// All Chrome/Edge quirks (force-reset, permission deny, no-speech) are handled.

const SpeechRecognitionModule = (() => {

  let recognition = null;
  let _isListening = false;

  // ── Browser API detection (call at runtime, NOT at load time) ─────────────
  function _getAPI() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  function isSupported() {
    return !!_getAPI();
  }

  function isListening() {
    return _isListening;
  }

  // ── Start recognition ────────────────────────────────────────────────────
  /**
   * @param {object} callbacks
   *   onInterim(text) — called with interim results while speaking
   *   onFinal(text)   — called with final recognised text
   *   onError(code, msg) — called on any error
   *   onStart()       — called when mic becomes active
   *   onEnd()         — called when recognition ends (any cause)
   */
  function start({ onInterim, onFinal, onError, onStart, onEnd } = {}) {
    const SR = _getAPI();
    if (!SR) {
      onError?.("not-supported", "Voice input is not supported. Please use Chrome or Edge.");
      return;
    }

    // Force-reset any stale instance BEFORE creating a new one.
    // This prevents the isListening guard from blocking a fresh attempt.
    if (recognition) {
      try { recognition.abort(); } catch (_) {}
      recognition = null;
    }
    _isListening = false;

    recognition = new SR();
    recognition.lang            = "en-US";
    recognition.interimResults  = true;
    recognition.maxAlternatives = 1;
    recognition.continuous      = false;

    recognition.onstart = () => {
      _isListening = true;
      console.log("[SpeechRecognition] onstart ✓");
      onStart?.();
    };

    recognition.onresult = (e) => {
      const interim = Array.from(e.results)
        .map(r => r[0].transcript)
        .join("");
      onInterim?.(interim);

      if (e.results[e.results.length - 1].isFinal) {
        const finalText = interim.trim();
        console.log("[SpeechRecognition] final:", finalText);
        // Mark done BEFORE cleanup so onend doesn't double-fire
        _isListening = false;
        _cleanup();
        onFinal?.(finalText);
      }
    };

    recognition.onerror = (e) => {
      console.error("[SpeechRecognition] error:", e.error);
      _isListening = false;

      const MESSAGES = {
        "not-allowed":   "Microphone access denied — allow it in browser settings.",
        "no-speech":     "No speech detected. Please try speaking louder.",
        "network":       "Network error during voice recognition.",
        "audio-capture": "No microphone found — please connect one.",
        "aborted":       "Listening cancelled.",
        "service-not-allowed": "Speech service blocked. Use HTTPS or localhost.",
      };
      onError?.(e.error, MESSAGES[e.error] || `Recognition error: ${e.error}`);
      setTimeout(_cleanup, 2200);
    };

    recognition.onend = () => {
      console.log("[SpeechRecognition] onend — wasListening:", _isListening);
      // Only clean up if we haven't already done so in onresult or stop()
      if (_isListening) {
        _isListening = false;
        _cleanup();
        onEnd?.();
      }
    };

    try {
      recognition.start();
      console.log("[SpeechRecognition] recognition.start() ✓");
    } catch (err) {
      console.error("[SpeechRecognition] start() threw:", err);
      _isListening = false;
      recognition  = null;
      onError?.("start-failed", "Could not start microphone: " + err.message);
    }
  }

  // ── Stop ─────────────────────────────────────────────────────────────────
  function stop() {
    _isListening = false;
    if (recognition) {
      try { recognition.stop(); } catch (_) {}
      recognition = null;
    }
  }

  function _cleanup() {
    recognition = null;
  }

  // ── Public API ────────────────────────────────────────────────────────────
  return { start, stop, isSupported, isListening };

})();
