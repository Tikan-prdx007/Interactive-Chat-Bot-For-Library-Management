// ─── TTSEngine — Premium Text-to-Speech Module ────────────────────────────────
// Priority: OpenAI TTS (/api/tts) → Browser TTS with smart voice picker → silent
// Voice prefs & speed persisted to localStorage under "bookflow_voice_prefs".

const TTSEngine = (() => {

  // ── Constants ────────────────────────────────────────────────────────────────
  const PREFS_KEY = "bookflow_voice_prefs";

  // Maps friendly voice keys → OpenAI voice names
  const OPENAI_VOICE_MAP = {
    female:  "nova",
    male:    "onyx",
    neutral: "alloy",
    shimmer: "shimmer",
    echo:    "echo",
  };

  // Gender hints for browser TTS voice picker
  const BROWSER_GENDER_HINT = {
    female:  "female",
    male:    "male",
    neutral: "neutral",
    shimmer: "female",
    echo:    "male",
  };

  // ── State ────────────────────────────────────────────────────────────────────
  let prefs = {
    voice:   "female",   // key from OPENAI_VOICE_MAP
    speed:   1.0,        // 0.8 – 1.5
    enabled: true,       // voice response on/off
  };

  // Single audio element — reused for every TTS call (prevents overlap)
  let audioEl   = null;
  let _speaking  = false;
  let _listeners = {};   // event callbacks: { start, end, error }

  // Whether the server confirmed OpenAI TTS is available
  let _openaiAvailable = null; // null = not probed yet, true/false after first call

  // ── Init ─────────────────────────────────────────────────────────────────────
  function init() {
    _loadPrefs();
    _ensureAudioEl();
    // Pre-probe TTS availability (silent – no text, just checks route)
    _probeTTS();
    console.log("[TTSEngine] init — voice:", prefs.voice, "speed:", prefs.speed, "enabled:", prefs.enabled);
  }

  async function _probeTTS() {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: " ", voice: "alloy" }),
      });
      if (res.headers.get("Content-Type")?.includes("audio")) {
        _openaiAvailable = true;
        console.log("[TTSEngine] OpenAI TTS: ✅ available");
      } else {
        const json = await res.json();
        _openaiAvailable = !json.fallback;
        console.log("[TTSEngine] OpenAI TTS:", _openaiAvailable ? "✅" : "🔄 fallback (browser TTS)");
      }
    } catch {
      _openaiAvailable = false;
    }
  }

  function _loadPrefs() {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) prefs = { ...prefs, ...JSON.parse(raw) };
    } catch {}
  }

  function _savePrefs() {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }

  // ── Audio element management ─────────────────────────────────────────────────
  function _ensureAudioEl() {
    if (audioEl) return;
    audioEl = document.createElement("audio");
    audioEl.id = "bookflow-tts-audio";
    audioEl.style.display = "none";
    audioEl.addEventListener("play",  () => { _speaking = true;  _emit("start"); });
    audioEl.addEventListener("ended", () => { _speaking = false; _emit("end");   });
    audioEl.addEventListener("error", () => { _speaking = false; _emit("error"); });
    document.body.appendChild(audioEl);
  }

  function _emit(event) {
    if (typeof _listeners[event] === "function") _listeners[event]();
  }

  // ── Core speak ───────────────────────────────────────────────────────────────
  /**
   * Speak text using the best available TTS.
   * @param {string} text
   * @param {object} [opts]  { voiceOverride, speedOverride }
   */
  async function speak(text, opts = {}) {
    if (!text || !text.trim() || !prefs.enabled) return;

    const cleanText = _stripHTML(text).replace(/\s+/g, " ").trim();
    if (!cleanText) return;

    // Stop anything currently playing
    stop();

    const voiceKey = opts.voiceOverride || prefs.voice;
    const speed    = opts.speedOverride  || prefs.speed;

    // Try OpenAI TTS first, unless we already know it's unavailable
    if (_openaiAvailable !== false) {
      const success = await _speakOpenAI(cleanText, voiceKey, speed);
      if (success) return;
    }

    // Fallback: Browser TTS
    _speakBrowser(cleanText, voiceKey, speed);
  }

  async function _speakOpenAI(text, voiceKey, speed) {
    try {
      const oaiVoice = OPENAI_VOICE_MAP[voiceKey] || "alloy";
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: oaiVoice }),
      });

      if (!res.ok) { _openaiAvailable = false; return false; }

      const contentType = res.headers.get("Content-Type") || "";
      if (!contentType.includes("audio")) {
        // Server returned fallback JSON
        const json = await res.json();
        if (json.fallback) { _openaiAvailable = false; return false; }
      }

      _openaiAvailable = true;
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);

      _ensureAudioEl();
      audioEl.src             = url;
      audioEl.playbackRate    = Math.min(Math.max(speed, 0.5), 2.0);
      audioEl.onended = () => { URL.revokeObjectURL(url); };
      await audioEl.play();
      return true;

    } catch (e) {
      console.warn("[TTSEngine] OpenAI TTS failed:", e.message);
      _openaiAvailable = false;
      return false;
    }
  }

  function _speakBrowser(text, voiceKey, speed) {
    if (!window.speechSynthesis) { _emit("error"); return; }
    window.speechSynthesis.cancel();

    const utt  = new SpeechSynthesisUtterance(text);
    utt.lang   = "en-US";
    utt.rate   = Math.min(Math.max(speed, 0.5), 2.0);
    utt.pitch  = voiceKey === "female" || voiceKey === "shimmer" ? 1.15 : 1.0;

    // Pick best browser voice
    const chosen = _pickBrowserVoice(BROWSER_GENDER_HINT[voiceKey] || "neutral");
    if (chosen) utt.voice = chosen;

    utt.onstart = () => { _speaking = true;  _emit("start"); };
    utt.onend   = () => { _speaking = false; _emit("end");   };
    utt.onerror = () => { _speaking = false; _emit("error"); };

    window.speechSynthesis.speak(utt);
  }

  /**
   * Pick the best browser voice for a given gender hint.
   * Ranking: Google US > Microsoft > first en-US match
   */
  function _pickBrowserVoice(gender) {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    const enUS = voices.filter(v => v.lang.startsWith("en"));

    // Prefer Google voices (most natural in Chrome)
    const google = enUS.filter(v => v.name.toLowerCase().includes("google"));
    // Then Microsoft
    const ms     = enUS.filter(v => v.name.toLowerCase().includes("microsoft"));

    const pools = [google, ms, enUS];

    for (const pool of pools) {
      if (!pool.length) continue;

      if (gender === "female") {
        const f = pool.find(v =>
          /female|woman|girl|zira|siri|nova|emma|aria|jenny|michelle|susan/i.test(v.name)
        );
        if (f) return f;
      }
      if (gender === "male") {
        const m = pool.find(v =>
          /male|man|david|mark|guy|james|ryan|eric|andrew|tom/i.test(v.name)
        );
        if (m) return m;
      }
      // Neutral or no match: just return first
      if (pool.length) return pool[0];
    }

    return voices[0];
  }

  // ── Stop ─────────────────────────────────────────────────────────────────────
  function stop() {
    // Stop HTML5 audio
    if (audioEl && !audioEl.paused) {
      audioEl.pause();
      audioEl.src = "";
    }
    // Stop browser TTS
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    _speaking = false;
  }

  // ── Settings getters / setters ───────────────────────────────────────────────
  function setVoice(key) {
    if (!OPENAI_VOICE_MAP[key]) return;
    prefs.voice = key;
    _savePrefs();
  }

  function getVoice() { return prefs.voice; }

  function setSpeed(rate) {
    prefs.speed = Math.min(Math.max(parseFloat(rate) || 1.0, 0.8), 1.5);
    _savePrefs();
  }

  function getSpeed() { return prefs.speed; }

  function setEnabled(enabled) {
    prefs.enabled = !!enabled;
    if (!prefs.enabled) stop();
    _savePrefs();
  }

  function isEnabled() { return prefs.enabled; }

  function isSpeaking() { return _speaking; }

  function isOpenAIAvailable() { return _openaiAvailable === true; }

  function getVoiceOptions() {
    return [
      { key: "female",  label: "Female",  icon: "👩",  desc: "Soft & natural"  },
      { key: "male",    label: "Male",    icon: "👨",  desc: "Deep & clear"    },
      { key: "neutral", label: "Neutral", icon: "🧑",  desc: "Balanced tone"   },
      { key: "shimmer", label: "Shimmer", icon: "✨",  desc: "Expressive"      },
      { key: "echo",    label: "Echo",    icon: "🔊",  desc: "Resonant"        },
    ];
  }

  /** Register event listeners for speaking start/end/error */
  function on(event, cb) {
    _listeners[event] = cb;
  }

  /** Utility: strip HTML tags from text before speaking */
  function _stripHTML(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  // ── Public API ───────────────────────────────────────────────────────────────
  return {
    init,
    speak,
    stop,
    setVoice,    getVoice,
    setSpeed,    getSpeed,
    setEnabled,  isEnabled,
    isSpeaking,  isOpenAIAvailable,
    getVoiceOptions,
    on,
    PREFS_KEY,
  };

})();
