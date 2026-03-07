// ─── App Core / State / Router ────────────────────────────────────────────────

// ── State Management (multi-user, backed by Auth) ─────────────────────────────
const AppState = (() => {
  let _username = null;
  let state = {
    student: JSON.parse(JSON.stringify(DEFAULT_STUDENT)),
    chatHistory: [],
  };

  function load() {
    _username = Auth.currentUser();
    if (!_username) return; // not logged in yet
    const data = Auth.loadUserData(_username);
    if (data) {
      state.student = { ...JSON.parse(JSON.stringify(DEFAULT_STUDENT)), ...data.student };
      state.chatHistory = data.chatHistory || [];
    } else {
      // First login after register — fresh profile
      state.student = JSON.parse(JSON.stringify(DEFAULT_STUDENT));
      state.chatHistory = [];
    }
  }

  function save() {
    if (!_username) return;
    Auth.saveUserData(_username, state.student, state.chatHistory);
  }

  function reset() {
    if (!_username) return;
    const key = "libramate_user_" + _username;
    localStorage.removeItem(key);
    location.reload();
  }

  return {
    get student() { return state.student; },
    get chatHistory() { return state.chatHistory; },
    get username() { return _username; },
    load, save, reset
  };
})();


// ── Main Application ──────────────────────────────────────────────────────────
const App = (() => {

  const PANELS = {
    home: () => renderHome(),
    library: () => LibraryModule.render(),
    dashboard: () => DashboardModule.render(),
    tutor: () => TutorModule.render(),
    chat: () => ChatModule.render(),
    voice: () => VoiceModule.render(),
  };

  let activePanel = "home";

  function init() {
    // If no user is logged in, show the login screen instead of the app
    if (!Auth.currentUser()) {
      LoginScreen.show();
      return;
    }
    afterLogin();
  }

  function afterLogin() {
    AppState.load();
    updateStreakAndLogin();
    renderSidebar();
    renderHeader();
    document.getElementById("app-shell").style.display = "flex";
    navigate("home");
    Gamification.renderXPBar();
    checkStreak();
    Theme.apply(Theme.get()); // sync toggle button icon
    Settings.load();          // apply saved font size & preferences
  }

  function logout() {
    Auth.logout();
    location.reload();
  }

  function updateStreakAndLogin() {
    const s = AppState.student;
    const today = new Date().toDateString();
    if (s.lastLogin === today) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (s.lastLogin === yesterday.toDateString()) {
      s.streak++;
    } else if (s.lastLogin && s.lastLogin !== today) {
      s.streak = 1;
    }
    s.lastLogin = today;
    AppState.save();
  }

  function checkStreak() {
    const s = AppState.student;
    if (s.streak >= 5) Gamification.checkAndAwardBadge("focused_learner");
    if (s.topicsCovered >= 15) Gamification.checkAndAwardBadge("scholar");
    if (s.xp >= 1000) Gamification.checkAndAwardBadge("master_mind");
  }

  function renderSidebar() {
    const nav = document.getElementById("sidebar-nav");
    const items = [
      { id: "home", icon: "🏠", label: "Home" },
      { id: "library", icon: "📚", label: "Library" },
      { id: "dashboard", icon: "📊", label: "Dashboard" },
      { id: "tutor", icon: "🧠", label: "Tutor" },
      { id: "chat", icon: "💬", label: "Chat" },
      { id: "voice", icon: "🎤", label: "Voice" },
    ];
    nav.innerHTML = items.map(item => `
      <button class="nav-btn ${activePanel === item.id ? 'active' : ''}" id="nav-${item.id}" onclick="App.navigate('${item.id}')">
        <span class="nav-icon">${item.icon}</span>
        <span class="nav-label">${item.label}</span>
      </button>`).join("") +
      `<button class="nav-btn nav-btn-settings" onclick="Settings.open()">
        <span class="nav-icon">⚙️</span>
        <span class="nav-label">Settings</span>
      </button>`;
  }

  function renderHeader() {
    const s = AppState.student;
    const info = Gamification.getLevelInfo(s.xp);
    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl("header-name", s.name);
    setEl("header-avatar", s.avatar);
    setEl("player-level", info.name);
    setEl("header-avatar-chip", s.avatar);
    setEl("header-name-chip", s.name);
    setEl("header-level", info.name);
  }

  function renderHome() {
    const s = AppState.student;
    const info = Gamification.getLevelInfo(s.xp);
    const hr = new Date().getHours();
    const greeting = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
    const weakSubj = Object.entries(s.subjectScores).sort((a, b) => a[1] - b[1])[0];
    const improvePct = Math.max(0, Math.round(s.quizAvg - 68));
    const panel = document.getElementById("panel-home");
    const recBook = LIBRARY_BOOKS.find(b => b.subject.toLowerCase().includes(weakSubj[0].toLowerCase()) && b.available) || LIBRARY_BOOKS.find(b => b.available) || LIBRARY_BOOKS[0];
    const recTopic = Object.keys(TOPICS).find(t => !s.recentTopics.includes(t)) || Object.keys(TOPICS)[0];
    panel.innerHTML = `
          <div class="home-greeting">
            <div class="greeting-label">Welcome back</div>
            <div class="greeting-name">${greeting}, <span>${s.name}!</span> ${s.avatar}</div>
            <div class="greeting-sub">
              ${s.streak > 1 ? `You're on a <strong>${s.streak}-day</strong> study streak! 🔥 ` : ""}
              ${improvePct > 0 ? `Your quiz accuracy improved by <strong>${improvePct}%</strong>. ` : ""}
              ${s.recentTopics.length ? `Last studied: <strong>${s.recentTopics[0]}</strong>. ` : ""}
              Ready to continue your journey today?
            </div>
            <div class="greeting-stats">
              <div class="g-stat">📅 <strong>${s.studyHoursWeek}</strong> hrs this week</div>
              <div class="g-stat">🎯 Quiz avg: <strong>${s.quizAvg}%</strong></div>
              <div class="g-stat">🏅 <strong>${info.name}</strong></div>
              <div class="g-stat">⭐ <strong>${s.xp}</strong> XP</div>
              <div class="g-stat">📚 <strong>${s.issuedBooks.length}</strong> books issued</div>
            </div>
          </div>
          <div class="home-quick-grid">
            <div class="quick-card" onclick="App.navigate('library')"><div class="qc-icon">📚</div><div class="qc-title">Library</div><div class="qc-desc">Search & reserve 30+ books</div></div>
            <div class="quick-card" onclick="App.navigate('dashboard')"><div class="qc-icon">📊</div><div class="qc-title">Dashboard</div><div class="qc-desc">Track your stats & performance</div></div>
            <div class="quick-card" onclick="App.navigate('tutor')"><div class="qc-icon">🧠</div><div class="qc-title">Tutor</div><div class="qc-desc">Learn with explanations & quizzes</div></div>
            <div class="quick-card" onclick="App.navigate('chat')"><div class="qc-icon">💬</div><div class="qc-title">AI Chat</div><div class="qc-desc">Get personalized academic help</div></div>
            <div class="quick-card" onclick="App.navigate('voice')"><div class="qc-icon">🎤</div><div class="qc-title">Voice Mode</div><div class="qc-desc">Talk to SHELFBOT hands-free</div></div>
          </div>
          <div class="home-recommend">
            <h3>📌 Recommended for You, ${s.name}</h3>
            <div class="rec-list">
              <div class="rec-item" onclick="App.navigate('library')" style="cursor:pointer">
                <div class="rec-emoji">${recBook.emoji}</div>
                <div class="rec-info"><div class="rec-title">${recBook.title}</div><div class="rec-sub">📚 Book · ${recBook.subject} · Shelf ${recBook.shelf}</div></div>
              </div>
              <div class="rec-item" onclick="App.navigate('tutor')" style="cursor:pointer">
                <div class="rec-emoji">🧠</div>
                <div class="rec-info"><div class="rec-title">Study: ${recTopic}</div><div class="rec-sub">🎯 Topic · New for you</div></div>
              </div>
              <div class="rec-item" onclick="App.navigate('dashboard')" style="cursor:pointer">
                <div class="rec-emoji">⚠️</div>
                <div class="rec-info"><div class="rec-title">Improve: ${weakSubj[0]}</div><div class="rec-sub">📊 Current score: ${weakSubj[1]}% — needs attention</div></div>
              </div>
            </div>
          </div>`;
  }

  function navigate(panelId) {
    activePanel = panelId;
    // Update nav
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    const btn = document.getElementById(`nav-${panelId}`);
    if (btn) btn.classList.add("active");
    // Render panel
    document.querySelectorAll(".panel").forEach(p => p.style.display = "none");
    const panel = document.getElementById(`panel-${panelId}`);
    if (panel) {
      panel.style.display = "block";
      PANELS[panelId]?.();
    }
    Gamification.renderXPBar();
  }

  return { init, afterLogin, navigate, logout };
})();

// Export generateReplyText for voice module
ChatModule.generateReplyText = function (text) {
  // Reuse logic from send but return object without navigating
  const t = text.toLowerCase();
  const s = AppState.student;
  const name = s.name;
  if (/hi|hello|hey/.test(t)) return { text: `Hey ${name}! How can I help you?` };
  if (/book|find|library/.test(t)) return { text: `I'll search the library for you! Say a book title or subject.`, navigate: "library" };
  if (/progress|dashboard|stats/.test(t)) return { text: `Your quiz average is ${s.quizAvg}% and streak is ${s.streak} days! Great going, ${name}!`, navigate: "dashboard" };
  if (/explain|recursion|stack|queue|array|binary|oop/.test(t)) {
    const topicGuess = Object.keys(TOPICS).find(tp => t.includes(tp.toLowerCase().split(" ")[0]));
    return { text: `Great! Opening the tutor for ${topicGuess || "your topic"} now!`, navigate: "tutor" };
  }
  if (/motivat|inspire|cheer/.test(t)) return { text: `You're doing awesome, ${name}! Keep going! 💪` };
  return { text: `Interesting! Could you clarify — are you asking about a book, topic, or your progress?` };
};

// ── Boot ──────────────────────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => App.init());
