// ─── Settings Module ──────────────────────────────────────────────────────────
// Renders a slide-out Settings drawer from the right side of the screen.
// Persists preferences in localStorage under "libramate_settings".

const Settings = (() => {
  const KEY = "libramate_settings";

  const DEFAULTS = {
    theme: "dark",         // "dark" | "light"
    fontSize: "medium",   // "small" | "medium" | "large" | "xl"
    notifications: true,
  };

  // Voice defaults are stored separately by TTSEngine (bookflow_voice_prefs)
  // We read/write them via TTSEngine API so there's a single source of truth.

  const FONT_SIZES = {
    small: "13px",
    medium: "15px",
    large: "17px",
    xl: "19px",
  };

  let prefs = { ...DEFAULTS };
  let overlay = null;

  // ── Load / Save ────────────────────────────────────────────────────────────
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) prefs = { ...DEFAULTS, ...JSON.parse(raw) };
    } catch { }
    // Always sync theme from Theme module (single source of truth — defaults to dark)
    prefs.theme = Theme.get();
    _applyAll();
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  }

  function _applyAll() {
    // Theme — use Theme module's stored value as the authoritative source
    Theme.apply(Theme.get());
    // Font size
    document.documentElement.style.fontSize = FONT_SIZES[prefs.fontSize] || FONT_SIZES.medium;
  }

  // ── Internal helpers ───────────────────────────────────────────────────────
  function _notifBell() {
    const bell = document.getElementById("notif-bell-icon");
    if (bell) bell.textContent = prefs.notifications ? "🔔" : "🔕";
  }

  function addNotification(msg) {
    if (!prefs.notifications) return;
    const list = _getNotifList();
    list.unshift({ msg, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
    if (list.length > 20) list.pop();
    localStorage.setItem("libramate_notifications", JSON.stringify(list));
    // Flash the bell
    const bell = document.getElementById("notif-bell-icon");
    if (bell) {
      bell.classList.add("bell-ring");
      setTimeout(() => bell.classList.remove("bell-ring"), 600);
    }
  }

  function _getNotifList() {
    try { return JSON.parse(localStorage.getItem("libramate_notifications")) || []; } catch { return []; }
  }

  // ── Drawer open / close ───────────────────────────────────────────────────
  function open() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.id = "settings-overlay";
    overlay.innerHTML = `
      <div class="settings-backdrop" onclick="Settings.close()"></div>
      <aside class="settings-drawer" role="dialog" aria-label="Settings">
        <!-- Header -->
        <div class="sd-header">
          <div class="sd-title">
            <span class="sd-title-icon">⚙️</span>
            <span>Settings</span>
          </div>
          <button class="sd-close" onclick="Settings.close()" aria-label="Close">✕</button>
        </div>

        <!-- ── VOICE SETTINGS ── -->
        <section class="sd-section sd-section-voice">
          <div class="sd-section-label">🎙️ Voice Settings</div>

          <!-- Voice selector cards -->
          <div class="sd-voice-label">Voice Style</div>
          <div class="sd-voice-grid" id="sd-voice-grid">
            ${_renderVoiceCards()}
          </div>

          <!-- Preview button -->
          <button class="sd-preview-btn" id="sd-preview-btn"
                  onclick="Settings._previewVoice()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Preview Voice
          </button>

          <!-- Speed slider -->
          <div class="sd-speed-row">
            <div class="sd-row-info">
              <div class="sd-row-title">Voice Speed</div>
              <div class="sd-row-sub">0.8× — 1.5×</div>
            </div>
            <div class="sd-speed-control">
              <input type="range" class="sd-speed-slider" id="sd-speed-slider"
                     min="0.8" max="1.5" step="0.05"
                     value="${TTSEngine.getSpeed()}"
                     oninput="Settings._onSpeedChange(this.value)"
                     onchange="Settings._onSpeedChange(this.value)">
              <span class="sd-speed-display" id="sd-speed-display">${TTSEngine.getSpeed().toFixed(1)}×</span>
            </div>
          </div>

          <!-- Voice response toggle -->
          <div class="sd-row">
            <div class="sd-row-info">
              <div class="sd-row-title">Voice Response</div>
              <div class="sd-row-sub">AI reads replies aloud</div>
            </div>
            <button class="sd-toggle ${TTSEngine.isEnabled() ? 'on' : ''}"
                    id="toggle-voice-resp"
                    onclick="Settings._toggleVoiceResp()"
                    aria-pressed="${TTSEngine.isEnabled()}">
              <span class="sd-toggle-knob"></span>
            </button>
          </div>
        </section>

        <!-- ── NOTIFICATIONS ── -->
        <section class="sd-section">
          <div class="sd-section-label">🔔 Notifications</div>
          <div class="sd-row">
            <div class="sd-row-info">
              <div class="sd-row-title">Enable Notifications</div>
              <div class="sd-row-sub">Badges, achievements & study reminders</div>
            </div>
            <button class="sd-toggle ${prefs.notifications ? 'on' : ''}"
                    id="toggle-notif"
                    onclick="Settings._toggleNotif()"
                    aria-pressed="${prefs.notifications}">
              <span class="sd-toggle-knob"></span>
            </button>
          </div>
        </section>

        <!-- ── THEME ── -->
        <section class="sd-section">
          <div class="sd-section-label">🎨 Theme</div>
          <div class="sd-theme-cards">
            <div class="sd-theme-card ${prefs.theme === 'dark' ? 'selected' : ''}"
                 onclick="Settings._setTheme('dark')" id="tc-dark">
              <div class="tc-preview tc-dark-prev"></div>
              <div class="tc-label">🌙 Dark</div>
            </div>
            <div class="sd-theme-card ${prefs.theme === 'light' ? 'selected' : ''}"
                 onclick="Settings._setTheme('light')" id="tc-light">
              <div class="tc-preview tc-light-prev"></div>
              <div class="tc-label">☀️ Light</div>
            </div>
          </div>
        </section>

        <!-- ── TEXT SIZE ── -->
        <section class="sd-section">
          <div class="sd-section-label">🔤 Text Size</div>
          <div class="sd-font-row">
            ${["small", "medium", "large", "xl"].map(sz => `
              <button class="sd-font-btn ${prefs.fontSize === sz ? 'selected' : ''}"
                      id="fs-${sz}"
                      onclick="Settings._setFont('${sz}')">
                <span class="sd-font-sample" style="font-size:${FONT_SIZES[sz]}">Aa</span>
                <span class="sd-font-label">${sz.charAt(0).toUpperCase() + sz.slice(1)}</span>
              </button>`).join("")}
          </div>
          <div class="sd-font-preview">
            <span id="font-preview-text">The quick brown fox jumps over the lazy dog.</span>
          </div>
        </section>

        <!-- ── NOTIFICATIONS LIST ── -->
        <section class="sd-section">
          <div class="sd-section-label-row">
            <span>📬 Recent Notifications</span>
            <button class="sd-link" onclick="Settings._clearNotifs()">Clear all</button>
          </div>
          <div class="sd-notif-list" id="sd-notif-list">
            ${_renderNotifList()}
          </div>
        </section>

        <!-- ── FEEDBACK ── -->
        <section class="sd-section">
          <div class="sd-section-label">💬 Send Feedback</div>
          <textarea class="sd-textarea" id="sd-feedback-text"
                    placeholder="Share your thoughts, report a bug, or suggest a feature…"
                    rows="3"></textarea>
          <button class="sd-btn-action" onclick="Settings._submitFeedback()">
            📤 Submit Feedback
          </button>
        </section>

        <!-- ── DANGER ZONE ── -->
        <section class="sd-section sd-section-danger">
          <div class="sd-section-label">⚠️ Account</div>
          <button class="sd-btn-action sd-btn-danger" onclick="Settings._confirmLogout()">
            🚪 Logout from BookFLow
          </button>
          <button class="sd-btn-action sd-btn-ghost" onclick="Settings._resetProgress()">
            🔄 Reset My Progress
          </button>
        </section>

        <p class="sd-footer">BookFLow v2.0 · Built with ❤️</p>
      </aside>`;

    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => {
      overlay.querySelector(".settings-drawer").classList.add("open");
      overlay.querySelector(".settings-backdrop").classList.add("open");
    });
  }

  function close() {
    if (!overlay) return;
    const drawer = overlay.querySelector(".settings-drawer");
    const backdrop = overlay.querySelector(".settings-backdrop");
    drawer.classList.remove("open");
    backdrop.classList.remove("open");
    setTimeout(() => { overlay.remove(); overlay = null; }, 340);
  }

  // ── Setting handlers ───────────────────────────────────────────────────────
  function _toggleNotif() {
    prefs.notifications = !prefs.notifications;
    const btn = document.getElementById("toggle-notif");
    if (btn) {
      btn.classList.toggle("on", prefs.notifications);
      btn.setAttribute("aria-pressed", prefs.notifications);
    }
    _notifBell();
    save();
    Gamification.showToast(
      prefs.notifications ? "🔔 Notifications enabled!" : "🔕 Notifications muted.",
      prefs.notifications ? "success" : "info"
    );
  }

  function _setTheme(theme) {
    prefs.theme = theme;
    Theme.apply(theme);
    save();
    // Update card selection
    document.querySelectorAll(".sd-theme-card").forEach(c => c.classList.remove("selected"));
    const card = document.getElementById(`tc-${theme}`);
    if (card) card.classList.add("selected");
  }

  function _setFont(size) {
    prefs.fontSize = size;
    document.documentElement.style.fontSize = FONT_SIZES[size];
    save();
    document.querySelectorAll(".sd-font-btn").forEach(b => b.classList.remove("selected"));
    const btn = document.getElementById(`fs-${size}`);
    if (btn) btn.classList.add("selected");
    const preview = document.getElementById("font-preview-text");
    if (preview) preview.style.fontSize = FONT_SIZES[size];
  }

  function _renderNotifList() {
    const list = _getNotifList();
    if (!list.length) return `<div class="sd-notif-empty">No notifications yet 🕊️</div>`;
    return list.map(n => `
      <div class="sd-notif-item">
        <span class="sd-notif-msg">${n.msg}</span>
        <span class="sd-notif-time">${n.time}</span>
      </div>`).join("");
  }

  // ── Voice Settings helpers ─────────────────────────────────────────────────
  function _renderVoiceCards() {
    const current = TTSEngine.getVoice();
    const opts = [
      { key: "female",  label: "Female",  icon: "👩", desc: "Soft & natural"  },
      { key: "male",    label: "Male",    icon: "👨", desc: "Deep & clear"    },
      { key: "neutral", label: "Neutral", icon: "🧑", desc: "Balanced"        },
      { key: "shimmer", label: "Shimmer", icon: "✨", desc: "Expressive"      },
      { key: "echo",    label: "Echo",    icon: "🔊", desc: "Resonant"        },
    ];
    return opts.map(o => `
      <button class="sd-voice-card ${current === o.key ? 'selected' : ''}"
              id="vc-${o.key}"
              onclick="Settings._setVoice('${o.key}')">
        <span class="vc-icon">${o.icon}</span>
        <span class="vc-label">${o.label}</span>
        <span class="vc-desc">${o.desc}</span>
      </button>`).join("");
  }

  function _setVoice(key) {
    TTSEngine.setVoice(key);
    // Update card selection
    document.querySelectorAll(".sd-voice-card").forEach(c => c.classList.remove("selected"));
    const card = document.getElementById(`vc-${key}`);
    if (card) card.classList.add("selected");
    Gamification.showToast(`🎙️ Voice changed to ${key.charAt(0).toUpperCase() + key.slice(1)}!`, "info");
  }

  function _previewVoice() {
    const btn = document.getElementById("sd-preview-btn");
    if (btn) { btn.textContent = "▶ Playing…"; btn.disabled = true; }
    TTSEngine.on("end",   () => { if (btn) { btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> Preview Voice'; btn.disabled = false; } });
    TTSEngine.on("error", () => { if (btn) { btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> Preview Voice'; btn.disabled = false; } });
    TTSEngine.speak("Hello! I'm your BookFLow Library Assistant. How can I help you today?");
  }

  function _onSpeedChange(val) {
    const rate = parseFloat(val);
    TTSEngine.setSpeed(rate);
    const display = document.getElementById("sd-speed-display");
    if (display) display.textContent = rate.toFixed(1) + "×";
  }

  function _toggleVoiceResp() {
    const newState = !TTSEngine.isEnabled();
    TTSEngine.setEnabled(newState);
    const btn = document.getElementById("toggle-voice-resp");
    if (btn) {
      btn.classList.toggle("on", newState);
      btn.setAttribute("aria-pressed", newState);
    }
    // Update mute button in AssistantModule header if visible
    const ttsBtn = document.getElementById("tts-toggle-btn");
    if (ttsBtn) ttsBtn.classList.toggle("active", newState);
    Gamification.showToast(
      newState ? "🔊 Voice response enabled" : "🔇 Voice response muted",
      newState ? "success" : "info"
    );
  }

  function _clearNotifs() {
    localStorage.removeItem("libramate_notifications");
    const list = document.getElementById("sd-notif-list");
    if (list) list.innerHTML = `<div class="sd-notif-empty">No notifications yet 🕊️</div>`;
  }

  function _submitFeedback() {
    const ta = document.getElementById("sd-feedback-text");
    if (!ta || !ta.value.trim()) {
      Gamification.showToast("Please write something before submitting! ✍️", "info");
      return;
    }
    // Store locally (no backend)
    const key = "libramate_feedback";
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    list.push({ text: ta.value.trim(), at: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(list));
    ta.value = "";
    Gamification.showToast("✅ Thank you for your feedback! It means a lot 💜", "success");
    addNotification("💬 Feedback submitted successfully.");
  }

  function _confirmLogout() {
    if (confirm("Are you sure you want to logout?")) {
      close();
      setTimeout(() => App.logout(), 300);
    }
  }

  function _resetProgress() {
    if (confirm("Reset all your progress? This cannot be undone.")) {
      close();
      setTimeout(() => AppState.reset(), 300);
    }
  }

  // Export addNotification so other modules can push notifications
  // Usage: Settings.notify("Book reserved! 📚")
  function notify(msg) { addNotification(msg); }

  return {
    load, open, close, notify,
    _toggleNotif, _setTheme, _setFont,
    _clearNotifs, _submitFeedback, _confirmLogout, _resetProgress,
    // Voice settings
    _setVoice, _previewVoice, _onSpeedChange, _toggleVoiceResp,
  };
})();
