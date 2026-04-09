// ─── Unified AI Assistant Module ──────────────────────────────────────────────
// Fully unified chat + voice interface.
// Delegates TTS → TTSEngine  |  Mic → SpeechRecognitionModule

const AssistantModule = (() => {

  // ── Module state ─────────────────────────────────────────────────────────────
  let isThinking     = false;  // waiting for API response?
  let continuousMode = false;  // auto-restart mic after each response?

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  function render() {
    const s     = AppState.student;
    const panel = document.getElementById("panel-assistant");
    if (!panel) return;

    const speechOk = SpeechRecognitionModule.isSupported();

    panel.innerHTML = `
      <div class="asst-shell">

        <!-- ── Header ──────────────────────────────────────────────────── -->
        <div class="asst-header">
          <div class="asst-header-left">
            <div class="asst-avatar-wrap">
              <div class="asst-avatar-orb" id="asst-avatar-orb">
                <span>🤖</span>
              </div>
              <!-- Speaking equalizer wave (visible while TTS plays) -->
              <div class="asst-wave-bars" id="asst-wave-bars">
                <span></span><span></span><span></span><span></span><span></span>
              </div>
            </div>
            <div class="asst-title-block">
              <div class="asst-name">BookFLow</div>
              <div class="asst-status">
                <span class="asst-status-dot online" id="asst-status-dot"></span>
                <span id="asst-status-text">Ready to assist you</span>
              </div>
            </div>
          </div>
          <div class="asst-header-right">
            <!-- Mute / unmute voice -->
            <button class="asst-icon-btn ${TTSEngine.isEnabled() ? 'active' : ''}" id="tts-toggle-btn"
              onclick="AssistantModule.toggleTTS()" title="Toggle AI voice">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" id="tts-wave-path"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" id="tts-wave-path2"/>
              </svg>
            </button>
            <!-- Continuous conversation mode -->
            ${speechOk ? `
            <button class="asst-icon-btn ${continuousMode ? 'active' : ''}" id="continuous-btn"
              onclick="AssistantModule.toggleContinuous()" title="Continuous voice mode">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
              </svg>
            </button>` : ''}
            <!-- Clear history -->
            <button class="asst-icon-btn" onclick="AssistantModule.clearHistory()" title="Clear conversation">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </button>
            <!-- Settings shortcut -->
            <button class="asst-icon-btn" onclick="Settings.open()" title="Voice settings">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
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
          <!-- Listen banner (shown while recording) -->
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

            <!-- Mic button -->
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

    // Wire TTSEngine speaking events → avatar animation
    TTSEngine.on("start", () => {
      document.getElementById("asst-wave-bars")?.classList.add("animating");
      _setStatus("speaking");
    });
    TTSEngine.on("end", () => {
      document.getElementById("asst-wave-bars")?.classList.remove("animating");
      _setStatus("ready");
      // Continuous mode: re-listen after TTS finishes
      if (continuousMode && SpeechRecognitionModule.isSupported() && !SpeechRecognitionModule.isListening()) {
        setTimeout(startListening, 400);
      }
    });

    _loadHistory();

    // Greet once per session
    if (!sessionStorage.getItem("asst-greeted") && AppState.chatHistory.length === 0) {
      const hr   = new Date().getHours();
      const time = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
      _addMessage("bot",
        `${time}, <strong>${s.name}</strong>! 👋 I'm your AI library assistant. ` +
        `You've studied <strong>${s.studyHoursWeek} hrs</strong> this week and your ` +
        `streak is <strong>${s.streak} days</strong> 🔥 — What can I help you with today?`,
        { skipTTS: true } // don't auto-read the greeting, just show it
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

  function _addMessage(role, text, opts = {}) {
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

    // Speak bot messages via TTSEngine (unless explicitly skipped)
    if (role === "bot" && !opts.skipTTS) {
      // Stop previous speech before starting new
      TTSEngine.stop();
      TTSEngine.speak(_stripHTML(text));
    }
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
  }

  function _scrollBottom() {
    const c = document.getElementById("asst-messages");
    if (c) c.scrollTop = c.scrollHeight;
  }

  function _hideChips() {
    const chips = document.getElementById("asst-chips");
    if (chips) { chips.style.opacity = "0"; chips.style.pointerEvents = "none"; }
  }

  function _stripHTML(html) {
    const d = document.createElement("div");
    d.innerHTML = html;
    return d.textContent || d.innerText || "";
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STATUS / AVATAR
  // ─────────────────────────────────────────────────────────────────────────────

  function _setStatus(state) {
    const dot  = document.getElementById("asst-status-dot");
    const text = document.getElementById("asst-status-text");
    const orb  = document.getElementById("asst-avatar-orb");
    if (!text) return;

    const states = {
      listening: { label: "Listening…",         dot: "listening", orb: true  },
      thinking:  { label: "Thinking…",          dot: "thinking",  orb: false },
      speaking:  { label: "Speaking…",           dot: "speaking",  orb: false },
      ready:     { label: "Ready to assist you", dot: "online",    orb: false },
    };
    const s = states[state] || states.ready;
    text.textContent = s.label;
    if (dot) dot.className = `asst-status-dot ${s.dot}`;
    if (orb) {
      s.orb ? orb.classList.add("orb-listening") : orb.classList.remove("orb-listening");
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SEND
  // ─────────────────────────────────────────────────────────────────────────────

  async function send(text) {
    if (!text.trim() || isThinking) return;
    isThinking = true;

    // Stop any ongoing TTS when sending a new message (interrupt)
    TTSEngine.stop();

    const btn = document.getElementById("asst-send-btn");
    if (btn) btn.disabled = true;

    _addMessage("user", text, { skipTTS: true });
    _showTyping();

    try {
      const res   = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message: text }),
      });
      _removeTyping();
      _setStatus("ready");
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data  = await res.json();
      const reply = data.reply || data.message || "Sorry, I couldn't get a response.";
      _addMessage("bot", reply.replace(/\n/g, "<br>"));

    } catch (err) {
      _removeTyping();
      _setStatus("ready");
      _addMessage("bot", "⚠️ Couldn't reach the server. Please check your connection.", { skipTTS: true });
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
    inp.value        = "";
    inp.style.height = "auto";
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
  // VOICE INPUT — delegates to SpeechRecognitionModule
  // ─────────────────────────────────────────────────────────────────────────────

  function toggleMic() {
    SpeechRecognitionModule.isListening() ? stopListening() : startListening();
  }

  function startListening() {
    // Stop TTS so mic doesn't pick it up
    TTSEngine.stop();

    SpeechRecognitionModule.start({
      onStart: () => {
        _setMicActive(true);
        _setStatus("listening");
        _listenBarShow();
      },
      onInterim: (text) => {
        const el = document.getElementById("asst-interim-text");
        if (el) el.textContent = text || "Listening…";
      },
      onFinal: (finalText) => {
        _listenCleanup();
        if (continuousMode) {
          send(finalText);
        } else {
          const inp = document.getElementById("asst-input");
          if (inp && finalText) { inp.value = finalText; autoResize(inp); inp.focus(); }
        }
      },
      onError: (_code, msg) => {
        _listenBarError(msg);
        setTimeout(_listenCleanup, 2200);
      },
      onEnd: () => {
        _listenCleanup();
      },
    });
  }

  function stopListening() {
    SpeechRecognitionModule.stop();
    _listenCleanup();
  }

  function _listenCleanup() {
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
  // CONTROLS
  // ─────────────────────────────────────────────────────────────────────────────

  function toggleTTS() {
    TTSEngine.setEnabled(!TTSEngine.isEnabled());
    _updateTTSButton();
    if (!TTSEngine.isEnabled()) TTSEngine.stop();
  }

  function _updateTTSButton() {
    const btn = document.getElementById("tts-toggle-btn");
    if (!btn) return;
    const enabled = TTSEngine.isEnabled();
    btn.classList.toggle("active", enabled);
    btn.title = enabled ? "Mute AI voice" : "Enable AI voice";
    const p1 = document.getElementById("tts-wave-path");
    const p2 = document.getElementById("tts-wave-path2");
    if (p1) p1.style.display = enabled ? "" : "none";
    if (p2) p2.style.display = enabled ? "" : "none";
  }

  function toggleContinuous() {
    continuousMode = !continuousMode;
    _updateContinuousButton();
    if (!continuousMode && SpeechRecognitionModule.isListening()) stopListening();
    if (continuousMode  && !SpeechRecognitionModule.isListening()) startListening();
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
    TTSEngine.stop();
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
