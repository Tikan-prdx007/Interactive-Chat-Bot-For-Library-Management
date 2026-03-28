// ─── Unified AI Assistant Module ──────────────────────────────────────────────
// Fuses chat + voice into one seamless experience.
// KEY MIC FIXES:
//   1. SpeechRecognition looked up at CALL TIME via _getSpeechAPI(), not at module load
//   2. isListening force-reset before each start() so stale state never blocks
//   3. onend only cleans up if we haven't already manually stopped
//   4. recognition.start() wrapped in try/catch for permission-denied cases
//   5. All errors surfaced to the user in the listen bar with clear messages

const AssistantModule = (() => {

  // ── Module state ────────────────────────────────────────────────────────────
  let recognition    = null;   // SpeechRecognition instance
  let isListening    = false;  // mic currently active?
  let isThinking     = false;  // waiting for API response?
  let ttsEnabled     = true;   // read AI replies aloud?
  let continuousMode = false;  // auto-restart mic after each response?

  // ── Runtime Speech API detection ────────────────────────────────────────────
  // Must be called at runtime, NOT at module-load time.
  // window.SpeechRecognition may be undefined until a user gesture occurs on
  // some browsers (especially mobile Chrome / Edge).
  function _getSpeechAPI() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  function _hasSpeech() {
    return !!_getSpeechAPI();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  function render() {
    const s     = AppState.student;
    const panel = document.getElementById("panel-assistant");
    if (!panel) return;

    const speechOk = _hasSpeech();

    panel.innerHTML = `
      <div class="asst-shell">

        <!-- ── Header ──────────────────────────────────────────────────── -->
        <div class="asst-header">
          <div class="asst-header-left">
            <div class="asst-avatar-wrap">
              <div class="asst-avatar-orb" id="asst-avatar-orb">
                <span>🤖</span>
              </div>
              <div class="asst-wave-bars" id="asst-wave-bars">
                <span></span><span></span><span></span><span></span><span></span>
              </div>
            </div>
            <div class="asst-title-block">
              <div class="asst-name">AmadeusAI</div>
              <div class="asst-status">
                <span class="asst-status-dot online" id="asst-status-dot"></span>
                <span id="asst-status-text">Ready to assist you</span>
              </div>
            </div>
          </div>
          <div class="asst-header-right">
            <button class="asst-icon-btn ${ttsEnabled ? 'active' : ''}" id="tts-toggle-btn"
              onclick="AssistantModule.toggleTTS()" title="Toggle AI voice">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" id="tts-wave-path"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" id="tts-wave-path2"/>
              </svg>
            </button>
            ${speechOk ? `
            <button class="asst-icon-btn ${continuousMode ? 'active' : ''}" id="continuous-btn"
              onclick="AssistantModule.toggleContinuous()" title="Continuous voice mode">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
              </svg>
            </button>` : ''}
            <button class="asst-icon-btn" onclick="AssistantModule.clearHistory()" title="Clear conversation">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- ── Suggestion chips ─────────────────────────────────────────── -->
        <div class="asst-chips" id="asst-chips">
          <button class="asst-chip" onclick="AssistantModule.quickSend('Find me a book on algorithms')">📚 Find a book</button>
          <button class="asst-chip" onclick="AssistantModule.quickSend('Show my study progress')">📊 My progress</button>
          <button class="asst-chip" onclick="AssistantModule.quickSend('Motivate me')">💪 Motivate me</button>
          <button class="asst-chip" onclick="AssistantModule.quickSend('What books are available?')">🔍 Available books</button>
        </div>

        <!-- ── Message thread ───────────────────────────────────────────── -->
        <div class="asst-messages" id="asst-messages"></div>

        <!-- ── Input area ───────────────────────────────────────────────── -->
        <div class="asst-input-wrap">
          <!-- Listen banner (hidden by default) -->
          <div class="asst-listen-bar" id="asst-listen-bar">
            <div class="listen-pulse"></div>
            <span id="asst-interim-text">Listening…</span>
            <button class="listen-cancel-btn" onclick="AssistantModule.stopListening()">✕ Stop</button>
          </div>

          <div class="asst-input-row">
            <textarea
              id="asst-input"
              class="asst-textarea"
              rows="1"
              placeholder="Ask me anything…"
              onkeydown="AssistantModule.handleKey(event)"
              oninput="AssistantModule.autoResize(this)"
            ></textarea>

            <!-- Mic button — always rendered; disabled attribute if unsupported -->
            <button
              class="asst-mic-btn${speechOk ? '' : ' mic-disabled'}"
              id="asst-mic-btn"
              onclick="AssistantModule.toggleMic()"
              title="${speechOk ? 'Click to speak' : 'Voice not supported (use Chrome/Edge)'}"
              ${speechOk ? '' : 'disabled'}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
              <div class="mic-ripple" id="mic-ripple"></div>
            </button>

            <!-- Send button -->
            <button class="asst-send-btn" id="asst-send-btn" onclick="AssistantModule.sendInput()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>

      </div>
    `;

    _loadHistory();

    // Greet once per session
    if (!sessionStorage.getItem("asst-greeted") && AppState.chatHistory.length === 0) {
      const hr   = new Date().getHours();
      const time = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
      _addMessage("bot",
        `${time}, <strong>${s.name}</strong>! 👋 I'm your AI assistant. ` +
        `You've studied <strong>${s.studyHoursWeek} hrs</strong> this week and your ` +
        `streak is <strong>${s.streak} days</strong> 🔥 — What can I help you with today?`
      );
      sessionStorage.setItem("asst-greeted", "1");
    }

    _updateTTSButton();
    _updateContinuousButton();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MESSAGE HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  function _parseMarkdown(text) {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g,     '<em>$1</em>')
      .replace(/`(.*?)`/g,       '<code class="inline-code">$1</code>')
      .replace(/\n/g,            '<br>');
  }

  function _loadHistory() {
    const container = document.getElementById("asst-messages");
    if (!container) return;
    AppState.chatHistory.slice(-40).forEach(m => container.appendChild(_makeBubble(m.role, m.text, m.time)));
    _scrollBottom();
    if (AppState.chatHistory.length > 0) _hideChips();
  }

  function _makeBubble(role, text, time) {
    const div   = document.createElement("div");
    div.className = `asst-msg ${role === "bot" ? "asst-msg-bot" : "asst-msg-user"}`;
    div.innerHTML = `
      ${role === "bot" ? '<div class="bot-avatar">🤖</div>' : ''}
      <div class="asst-bubble-wrap">
        <div class="asst-bubble">${_parseMarkdown(text)}</div>
        <div class="asst-msg-time">${time || ""}</div>
      </div>`;
    return div;
  }

  function _addMessage(role, text) {
    const container = document.getElementById("asst-messages");
    if (!container) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const div  = _makeBubble(role, text, time);

    // Slide-in animation
    div.style.opacity   = "0";
    div.style.transform = role === "bot" ? "translateX(-12px)" : "translateX(12px)";
    container.appendChild(div);
    requestAnimationFrame(() => {
      div.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      div.style.opacity    = "1";
      div.style.transform  = "translateX(0)";
    });

    _scrollBottom();
    _hideChips();

    if (role !== "typing") {
      AppState.chatHistory.push({ role, text, time });
      if (AppState.chatHistory.length > 120) AppState.chatHistory.shift();
      AppState.save();
    }

    if (role === "bot" && ttsEnabled) _speak(_stripHTML(text));
  }

  function _showTyping() {
    const container = document.getElementById("asst-messages");
    if (!container || document.getElementById("asst-typing")) return;
    const div   = document.createElement("div");
    div.className = "asst-msg asst-msg-bot";
    div.id        = "asst-typing";
    div.innerHTML = `
      <div class="bot-avatar">🤖</div>
      <div class="asst-bubble-wrap">
        <div class="asst-bubble typing-dots"><span></span><span></span><span></span></div>
      </div>`;
    container.appendChild(div);
    _scrollBottom();
    _setStatus("thinking");
  }

  function _removeTyping() {
    const t = document.getElementById("asst-typing");
    if (t) t.remove();
    _setStatus("ready");
  }

  function _scrollBottom() {
    const c = document.getElementById("asst-messages");
    if (c) c.scrollTop = c.scrollHeight;
  }

  function _hideChips() {
    const chips = document.getElementById("asst-chips");
    if (chips) { chips.style.opacity = "0"; chips.style.pointerEvents = "none"; }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STATUS / AVATAR
  // ─────────────────────────────────────────────────────────────────────────────

  function _setStatus(state) {
    const dot  = document.getElementById("asst-status-dot");
    const text = document.getElementById("asst-status-text");
    const orb  = document.getElementById("asst-avatar-orb");
    if (!text) return;

    if (state === "listening") {
      text.textContent = "Listening…";
      if (dot) dot.className = "asst-status-dot listening";
      orb?.classList.add("orb-listening");
      document.getElementById("asst-wave-bars")?.classList.add("animating");
    } else if (state === "thinking") {
      text.textContent = "Thinking…";
      if (dot) dot.className = "asst-status-dot thinking";
      orb?.classList.remove("orb-listening");
      document.getElementById("asst-wave-bars")?.classList.remove("animating");
    } else {
      text.textContent = "Ready to assist you";
      if (dot) dot.className = "asst-status-dot online";
      orb?.classList.remove("orb-listening");
      document.getElementById("asst-wave-bars")?.classList.remove("animating");
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SEND
  // ─────────────────────────────────────────────────────────────────────────────

  async function send(text) {
    if (!text.trim() || isThinking) return;
    isThinking = true;
    const btn = document.getElementById("asst-send-btn");
    if (btn) btn.disabled = true;

    _addMessage("user", text);
    _showTyping();

    try {
      const res   = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message: text }),
      });
      _removeTyping();
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data  = await res.json();
      const reply = data.reply || data.message || "Sorry, I couldn't get a response.";
      _addMessage("bot", reply.replace(/\n/g, "<br>"));

      // Continuous mode: re-listen after TTS finishes
      if (continuousMode && _hasSpeech() && !isListening) {
        const utt = window._lastUtt;
        if (utt) utt.onend = () => startListening();
        else setTimeout(() => startListening(), 600);
      }
    } catch (err) {
      _removeTyping();
      _addMessage("bot", "⚠️ Couldn't reach the server. Please check your connection.");
      console.error("[AssistantModule] fetch error:", err);
    } finally {
      isThinking = false;
      if (btn) btn.disabled = false;
    }
  }

  function sendInput() {
    const inp = document.getElementById("asst-input");
    if (!inp) return;
    const val = inp.value.trim();
    if (!val) return;
    inp.value          = "";
    inp.style.height   = "auto";
    send(val);
  }

  function quickSend(text) { send(text); }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendInput(); }
  }

  function autoResize(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VOICE INPUT  (the fixed section)
  // ─────────────────────────────────────────────────────────────────────────────

  function toggleMic() {
    console.log("[Mic] toggleMic — isListening:", isListening);
    isListening ? stopListening() : startListening();
  }

  function startListening() {
    console.log("[Mic] startListening");

    const SR = _getSpeechAPI();
    if (!SR) {
      console.warn("[Mic] SpeechRecognition unavailable");
      _listenBarError("Voice not supported. Use Chrome or Edge.");
      return;
    }

    // Abort any stale instance and reset state BEFORE creating a new one.
    // This prevents the isListening guard from blocking a fresh attempt.
    if (recognition) { try { recognition.abort(); } catch (_) {} recognition = null; }
    isListening = false;

    // Stop any TTS so mic doesn't pick it up
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    recognition = new SR();
    recognition.lang            = "en-US";
    recognition.interimResults  = true;
    recognition.maxAlternatives = 1;
    recognition.continuous      = false;

    recognition.onstart = () => {
      console.log("[Mic] onstart ✓");
      isListening = true;
      _setMicActive(true);
      _setStatus("listening");
      _listenBarShow();
    };

    recognition.onresult = (e) => {
      const interim = Array.from(e.results).map(r => r[0].transcript).join("");
      const el = document.getElementById("asst-interim-text");
      if (el) el.textContent = interim || "Listening…";

      if (e.results[e.results.length - 1].isFinal) {
        const finalText = interim.trim();
        console.log("[Mic] Final:", finalText);
        // Mark stopped BEFORE cleanup so onend doesn't double-fire
        isListening = false;
        _listenCleanup();

        if (continuousMode) {
          send(finalText);
        } else {
          const inp = document.getElementById("asst-input");
          if (inp && finalText) { inp.value = finalText; autoResize(inp); inp.focus(); }
        }
      }
    };

    recognition.onerror = (e) => {
      console.error("[Mic] error:", e.error);
      isListening = false;
      const msgs = {
        "not-allowed":   "Microphone access denied — allow it in browser settings.",
        "no-speech":     "No speech detected. Try speaking louder.",
        "network":       "Network error during voice recognition.",
        "audio-capture": "No microphone found.",
        "aborted":       "Listening cancelled.",
      };
      _listenBarError(msgs[e.error] || "Error: " + e.error);
      setTimeout(_listenCleanup, 2000);
    };

    recognition.onend = () => {
      console.log("[Mic] onend — isListening:", isListening);
      // Only clean up if we haven't already done so in onresult or stopListening
      if (isListening) { isListening = false; _listenCleanup(); }
    };

    try {
      recognition.start();
      console.log("[Mic] recognition.start() ✓");
    } catch (err) {
      console.error("[Mic] start() threw:", err);
      isListening = false;
      recognition = null;
      _listenBarError("Could not start mic: " + err.message);
    }
  }

  function stopListening() {
    console.log("[Mic] stopListening");
    isListening = false;
    if (recognition) { try { recognition.stop(); } catch (_) {} recognition = null; }
    _listenCleanup();
  }

  // Shared cleanup for all end paths (success, error, manual stop)
  function _listenCleanup() {
    recognition = null;
    _setMicActive(false);
    _setStatus("ready");
    _listenBarHide();
  }

  function _setMicActive(active) {
    const btn    = document.getElementById("asst-mic-btn");
    const ripple = document.getElementById("mic-ripple");
    if (!btn) return;
    btn.classList.toggle("mic-recording", active);
    if (ripple) ripple.style.display = active ? "block" : "none";
  }

  function _listenBarShow() {
    const bar = document.getElementById("asst-listen-bar");
    const txt = document.getElementById("asst-interim-text");
    if (bar) bar.classList.add("visible");
    if (txt) txt.textContent = "Listening…";
  }

  function _listenBarError(msg) {
    const bar = document.getElementById("asst-listen-bar");
    const txt = document.getElementById("asst-interim-text");
    if (bar) bar.classList.add("visible");
    if (txt) txt.textContent = "⚠️ " + msg;
  }

  function _listenBarHide() {
    const bar = document.getElementById("asst-listen-bar");
    const txt = document.getElementById("asst-interim-text");
    if (bar) bar.classList.remove("visible");
    if (txt) txt.textContent = "Listening…";
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEXT-TO-SPEECH
  // ─────────────────────────────────────────────────────────────────────────────

  function _speak(text) {
    if (!window.speechSynthesis || !ttsEnabled || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang  = "en-US";
    utt.rate  = 1.05;
    utt.pitch = 1.05;
    window._lastUtt = utt;
    window.speechSynthesis.speak(utt);
  }

  function _stripHTML(html) {
    const d = document.createElement("div");
    d.innerHTML = html;
    return d.textContent || d.innerText || "";
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CONTROLS
  // ─────────────────────────────────────────────────────────────────────────────

  function toggleTTS() {
    ttsEnabled = !ttsEnabled;
    if (!ttsEnabled && window.speechSynthesis) window.speechSynthesis.cancel();
    _updateTTSButton();
  }

  function _updateTTSButton() {
    const btn = document.getElementById("tts-toggle-btn");
    if (!btn) return;
    btn.classList.toggle("active", ttsEnabled);
    btn.title = ttsEnabled ? "Mute AI voice" : "Enable AI voice";
    const p1 = document.getElementById("tts-wave-path");
    const p2 = document.getElementById("tts-wave-path2");
    if (p1) p1.style.display = ttsEnabled ? "" : "none";
    if (p2) p2.style.display = ttsEnabled ? "" : "none";
  }

  function toggleContinuous() {
    continuousMode = !continuousMode;
    _updateContinuousButton();
    if (!continuousMode && isListening) stopListening();
    if (continuousMode  && !isListening) startListening();
  }

  function _updateContinuousButton() {
    const btn = document.getElementById("continuous-btn");
    if (!btn) return;
    btn.classList.toggle("active", continuousMode);
    btn.title = continuousMode ? "Stop continuous mode" : "Start continuous conversation";
  }

  function clearHistory() {
    if (!confirm("Clear the entire conversation history?")) return;
    AppState.chatHistory.length = 0;
    AppState.save();
    sessionStorage.removeItem("asst-greeted");
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    stopListening();
    render();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────────────────
  return {
    render,
    send,
    sendInput,
    quickSend,
    handleKey,
    autoResize,
    toggleMic,
    startListening,
    stopListening,
    toggleTTS,
    toggleContinuous,
    clearHistory,
  };

})();
