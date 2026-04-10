// ─── Smart Dashboard Module ───────────────────────────────────────────────────

const DashboardModule = (() => {

  let _tipsLoading = false;

  // ─── Main Render ───────────────────────────────────────────────────────────
  function render() {
    const s    = AppState.student;
    const info = Gamification.getLevelInfo(s.xp);

    // Ensure daily goals exist and reset if needed
    _checkDailyGoalReset(s);

    const subjectEntries = Object.entries(s.subjectScores);
    const strongSubject  = subjectEntries.sort((a, b) => b[1] - a[1])[0];
    const weakSubject    = subjectEntries.sort((a, b) => a[1] - b[1])[0];
    const totalAcc       = s.quizQuestions > 0
      ? Math.round((s.quizCorrect / s.quizQuestions) * 100) : s.quizAvg;

    const panel = document.getElementById("panel-dashboard");
    panel.innerHTML = `
      <div class="dash-shell">

        <!-- ── Header ──────────────────────────────────────────── -->
        <div class="dash-hdr">
          <div>
            <h2 class="dash-hdr-title">📊 Smart Dashboard</h2>
            <p class="dash-hdr-sub">AI-powered analytics · Personalized insights</p>
          </div>
          <div class="dash-hdr-level">
            <div class="dash-level-badge">${info.name}</div>
            <div class="dash-xp-mini">${s.xp} XP</div>
          </div>
        </div>

        <!-- ── A. Quiz Progress Overview ───────────────────────── -->
        <div class="dash-section-label">📌 Quiz Progress Overview</div>
        <div class="dash-stat-row">
          ${_statCard("🧠", "Total Quizzes", s.quizTotal, "indigo")}
          ${_statCard("🎯", "Avg Score", s.quizAvg + "%", s.quizAvg >= 75 ? "green" : "orange")}
          ${_statCard("✅", "Accuracy", totalAcc + "%", totalAcc >= 75 ? "teal" : "red")}
          ${_statCard("🔥", "Streak", s.streak + " days", "gold")}
          ${_statCard("📅", "Study Hours", s.studyHoursWeek + "h", "blue")}
          ${_statCard("⭐", "Total XP", s.xp, "pink")}
        </div>

        <!-- ── B + C: Two-column: Subject chart + Weekly Hours ─── -->
        <div class="dash-two-col">

          <!-- B. Subject Performance -->
          <div class="dash-card">
            <div class="dash-card-title">📚 Subject Performance</div>
            <div class="dash-card-sub">Based on quiz accuracy · Color = strength level</div>
            <div class="subj-chart-wrap" id="subj-chart-wrap">
              ${_renderSubjectBars(s.subjectScores, s.subjectAccuracy || {})}
            </div>
            <div class="subj-legend">
              <span class="legend-dot green"></span>Strong (≥80%)
              <span class="legend-dot yellow"></span>Moderate (60–79%)
              <span class="legend-dot red"></span>Needs Work (&lt;60%)
            </div>
          </div>

          <!-- C. Weekly Study Hours -->
          <div class="dash-card">
            <div class="dash-card-title">⏱️ Weekly Study Hours</div>
            <div class="dash-card-sub">Mon–Sun · Total: <strong>${s.studyHoursWeek}h</strong> this week</div>
            <div class="weekly-chart-container">
              ${_renderWeeklyBars(s.weeklyHours)}
            </div>
          </div>
        </div>

        <!-- ── D. AI Improvement Tips ──────────────────────────── -->
        <div class="dash-card dash-tips-card">
          <div class="dash-card-header-row">
            <div>
              <div class="dash-card-title">💡 AI Improvement Tips</div>
              <div class="dash-card-sub">Personalized feedback powered by AI</div>
            </div>
            <button class="tips-refresh-btn" id="tips-refresh-btn"
              onclick="DashboardModule.refreshTips()">🔄 Refresh</button>
          </div>
          <div class="tips-list" id="tips-list">
            <div class="tips-loading">
              <div class="tips-spinner"></div>
              <span>Generating personalized insights…</span>
            </div>
          </div>
        </div>

        <!-- ── E. Daily Goals ─────────────────────────────────── -->
        <div class="dash-two-col">
          <div class="dash-card">
            <div class="dash-card-title">🎯 Daily Goals</div>
            <div class="dash-card-sub">Set targets · Track completion · Earn badges</div>
            <div class="goals-grid" id="goals-grid">
              ${_renderGoals(s.dailyGoals)}
            </div>
            <div class="goals-actions">
              <div class="goals-set-row">
                <label>📚 Study goal (min):</label>
                <input type="number" id="goal-study-input" value="${s.dailyGoals.studyMins}"
                  min="5" max="240" class="goal-input"
                  onchange="DashboardModule.updateGoal('studyMins', this.value)"/>
              </div>
              <div class="goals-set-row">
                <label>🧠 Quiz goal (count):</label>
                <input type="number" id="goal-quiz-input" value="${s.dailyGoals.quizCount}"
                  min="1" max="10" class="goal-input"
                  onchange="DashboardModule.updateGoal('quizCount', this.value)"/>
              </div>
              <button class="log-study-btn" onclick="DashboardModule.logStudySession()">
                ⏱️ Log 25-min Study Session
              </button>
            </div>
          </div>

          <!-- Badges -->
          <div class="dash-card">
            <div class="dash-card-title">🏅 Your Badges</div>
            <div class="dash-card-sub">${s.badges.length} earned · Keep going for more!</div>
            <div class="badges-grid-new">
              ${s.badges.map(b => `<div class="badge-pill-new">${b}</div>`).join("") ||
                '<p class="muted">No badges yet — complete a quiz to earn your first!</p>'}
            </div>

            <!-- XP progress bar -->
            <div class="xp-section-dash">
              <div class="xp-prog-labels">
                <span>${info.name}</span>
                <span>${s.xp} XP → ${info.next ? info.next.name + " (" + info.next.minXP + ")" : "MAX LEVEL"}</span>
              </div>
              <div class="xp-track-dash">
                <div class="xp-fill-dash" style="width:${info.progress}%"></div>
              </div>
              <div class="xp-prog-pct">${info.progress}% to next level</div>
            </div>
          </div>
        </div>

        <!-- Recent Topics -->
        <div class="dash-card">
          <div class="dash-card-title">📌 Recent Topics & History</div>
          <div class="dash-two-col" style="margin-top:0.75rem">
            <div>
              <div class="dash-card-sub" style="margin-bottom:0.5rem">Topics Studied</div>
              <ul class="recent-topics-new">
                ${(s.recentTopics || []).map(t => `<li>📍 ${t}</li>`).join("") || "<li class='muted'>No topics yet</li>"}
              </ul>
            </div>
            <div>
              <div class="dash-card-sub" style="margin-bottom:0.5rem">Quiz History (last 5)</div>
              <div class="mini-quiz-history">
                ${(s.quizHistory || []).slice(-5).reverse().map(h => `
                  <div class="mqh-item">
                    <span class="mqh-subj">${h.subject}</span>
                    <span class="mqh-score ${h.accuracy >= 80 ? 'good' : h.accuracy >= 60 ? 'ok' : 'low'}">${h.score}/${h.total} · ${h.accuracy}%</span>
                    <span class="mqh-date">${h.date}</span>
                  </div>`).join("") || '<div class="muted" style="padding:0.5rem 0">No quiz history yet</div>'}
              </div>
            </div>
          </div>
        </div>

      </div>`;

    // Load AI tips async after render
    _loadTips(s);
  }

  // ─── STAT CARD ─────────────────────────────────────────────────────────────
  function _statCard(icon, label, value, color) {
    return `<div class="dash-stat-card stat-${color}">
      <div class="dsc-icon">${icon}</div>
      <div class="dsc-value">${value}</div>
      <div class="dsc-label">${label}</div>
    </div>`;
  }

  // ─── SUBJECT BARS ──────────────────────────────────────────────────────────
  function _renderSubjectBars(scores, accuracy) {
    return Object.entries(scores).map(([subj, baseScore]) => {
      // Use quiz accuracy if available, else baseline score
      const acc    = accuracy[subj];
      const score  = acc ? Math.round((acc.correct / acc.total) * 100) : baseScore;
      const refTx  = acc ? `${acc.correct}/${acc.total} quiz Qs` : "baseline score";
      const color  = score >= 80 ? "green" : score >= 60 ? "yellow" : "red";
      return `
        <div class="subj-bar-row">
          <div class="subj-bar-top">
            <span class="subj-name">${subj}</span>
            <span class="subj-pct ${color}">${score}%</span>
          </div>
          <div class="subj-bar-track">
            <div class="subj-bar-fill fill-${color}" style="width:0%" data-target="${score}"></div>
          </div>
          <div class="subj-ref">${refTx}</div>
        </div>`;
    }).join("");
  }

  // ─── WEEKLY BARS ───────────────────────────────────────────────────────────
  function _renderWeeklyBars(hours) {
    const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    const max  = Math.max(...(hours || [0,0,0,0,0,0,0]), 1);
    const todayIdx = (new Date().getDay() + 6) % 7;
    return `
      <div class="weekly-bars-grid">
        ${(hours || [0,0,0,0,0,0,0]).map((h, i) => {
          const pct   = Math.round((h / max) * 100);
          const today = i === todayIdx;
          return `
            <div class="week-col">
              <div class="week-bar-wrap">
                <div class="week-bar${today ? ' today' : ''}"
                  style="height:0%" data-target="${pct}" title="${h}h">
                  <div class="week-bar-glow"></div>
                </div>
              </div>
              <div class="week-day${today ? ' today-label' : ''}">${days[i]}</div>
              <div class="week-h">${h}h</div>
            </div>`;
        }).join("")}
      </div>`;
  }

  // ─── DAILY GOALS ───────────────────────────────────────────────────────────
  function _checkDailyGoalReset(s) {
    if (!s.dailyGoals) s.dailyGoals = { studyMins: 30, quizCount: 2, studyDone: 0, quizDone: 0, lastGoalDate: null };
    const today = new Date().toDateString();
    if (s.dailyGoals.lastGoalDate !== today) {
      s.dailyGoals.studyDone    = 0;
      s.dailyGoals.quizDone     = 0;
      s.dailyGoals.lastGoalDate = today;
      AppState.save();
    }
  }

  function _renderGoals(goals) {
    const studyPct = Math.min(100, Math.round((goals.studyDone / Math.max(goals.studyMins, 1)) * 100));
    const quizPct  = Math.min(100, Math.round((goals.quizDone  / Math.max(goals.quizCount,  1)) * 100));
    return `
      <div class="goal-ring-wrap">
        ${_goalRing(studyPct, "📚", `${goals.studyDone}/${goals.studyMins}`, "min study")}
        ${_goalRing(quizPct,  "🧠", `${goals.quizDone}/${goals.quizCount}`, "quizzes")}
      </div>`;
  }

  function _goalRing(pct, icon, value, label) {
    const color = pct >= 100 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#6c63ff";
    return `
      <div class="goal-ring-item">
        <div class="goal-ring-svg">
          <svg viewBox="0 0 100 100">
            <circle class="gr-track" cx="50" cy="50" r="42"/>
            <circle class="gr-fill" cx="50" cy="50" r="42"
              stroke="${color}"
              stroke-dasharray="${2 * Math.PI * 42}"
              stroke-dashoffset="${2 * Math.PI * 42 * (1 - pct / 100)}"
              style="transition:stroke-dashoffset 1s ease"/>
          </svg>
          <div class="gr-inner">
            <div class="gr-icon">${icon}</div>
            <div class="gr-val">${value}</div>
          </div>
        </div>
        <div class="gr-label">${label}</div>
        <div class="gr-pct" style="color:${color}">${pct}%</div>
      </div>`;
  }

  // ─── AI TIPS ───────────────────────────────────────────────────────────────
  async function _loadTips(s) {
    if (_tipsLoading) return;
    _tipsLoading = true;

    const subjectEntries = Object.entries(s.subjectScores);
    const weakSubject    = subjectEntries.sort((a, b) => a[1] - b[1])[0];
    const strongSubject  = subjectEntries.sort((a, b) => b[1] - a[1])[0];
    const totalAcc       = s.quizQuestions > 0
      ? Math.round((s.quizCorrect / s.quizQuestions) * 100) : s.quizAvg;

    const payload = {
      quizAvg:       s.quizAvg,
      accuracy:      totalAcc,
      studyHours:    s.studyHoursWeek,
      streak:        s.streak,
      weakSubject:   weakSubject[0],
      weakScore:     weakSubject[1],
      strongSubject: strongSubject[0],
      strongScore:   strongSubject[1],
      quizTotal:     s.quizTotal,
    };

    try {
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      _renderTips(data.tips || [], data.source || "fallback");
    } catch (e) {
      _renderTips(_ruleFallbackTips(s), "offline");
    } finally {
      _tipsLoading = false;
    }
  }

  function _renderTips(tips, source) {
    const el = document.getElementById("tips-list");
    if (!el) return;
    if (!tips || !tips.length) {
      el.innerHTML = `<div class="tips-empty">Could not load tips. Please try again.</div>`;
      return;
    }
    const badge = source === "ai" ? `<span class="tips-source-badge ai">✨ AI-Powered</span>` :
                  source === "offline" ? `<span class="tips-source-badge offline">📡 Offline Mode</span>` :
                  `<span class="tips-source-badge fallback">📊 Data-Driven</span>`;
    el.innerHTML = badge + tips.map((t, i) => `
      <div class="tip-item" style="animation-delay:${i * 0.15}s">
        <div class="tip-icon">${t.icon || "💡"}</div>
        <div class="tip-text">${t.tip}</div>
      </div>`).join("");
  }

  function _ruleFallbackTips(s) {
    const tips           = [];
    const subjectEntries = Object.entries(s.subjectScores);
    const weakSubject    = subjectEntries.sort((a, b) => a[1] - b[1])[0];
    if (weakSubject[1] < 70)
      tips.push({ icon: "⚠️", tip: `Your ${weakSubject[0]} score is ${weakSubject[1]}%. Complete 2-3 quizzes on this topic to improve.` });
    if (s.studyHoursWeek < 8)
      tips.push({ icon: "⏱️", tip: `You've studied ${s.studyHoursWeek}h this week. Aim for at least 2h daily to build strong study habits.` });
    if (s.streak < 3)
      tips.push({ icon: "🔥", tip: "Your streak is " + s.streak + " day(s). Study every day this week to unlock the 3-Day Streak badge!" });
    if (tips.length < 3)
      tips.push({ icon: "💡", tip: "Use the Pomodoro Method (25 min focus + 5 min break) to maximize retention and avoid burnout." });
    return tips.slice(0, 3);
  }

  // ── Public: Refresh tips ────────────────────────────────────────────────────
  function refreshTips() {
    _tipsLoading = false;
    const el = document.getElementById("tips-list");
    if (el) el.innerHTML = `<div class="tips-loading"><div class="tips-spinner"></div><span>Refreshing…</span></div>`;
    _loadTips(AppState.student);
  }

  // ── Public: Update goals ────────────────────────────────────────────────────
  function updateGoal(key, val) {
    const s = AppState.student;
    if (!s.dailyGoals) s.dailyGoals = { studyMins: 30, quizCount: 2, studyDone: 0, quizDone: 0, lastGoalDate: null };
    s.dailyGoals[key] = Math.max(1, parseInt(val) || 1);
    AppState.save();
    const grid = document.getElementById("goals-grid");
    if (grid) grid.innerHTML = _renderGoals(s.dailyGoals);
  }

  // ── Public: Log a study session ─────────────────────────────────────────────
  function logStudySession() {
    Gamification.recordStudyTime(25);
    // Re-render goals ring
    const s    = AppState.student;
    const grid = document.getElementById("goals-grid");
    if (grid) grid.innerHTML = _renderGoals(s.dailyGoals);
    // Animate bars again
    setTimeout(_animateBars, 100);
  }

  // ── Animate bars on render ──────────────────────────────────────────────────
  function _animateBars() {
    document.querySelectorAll(".subj-bar-fill[data-target]").forEach(el => {
      const t = el.getAttribute("data-target");
      requestAnimationFrame(() => { el.style.transition = "width 0.8s ease"; el.style.width = t + "%"; });
    });
    document.querySelectorAll(".week-bar[data-target]").forEach(el => {
      const t = el.getAttribute("data-target");
      requestAnimationFrame(() => { el.style.transition = "height 0.8s ease"; el.style.height = t + "%"; });
    });
  }

  // Expose render so app.js can call it; attach animation after render
  const _origRender = render;
  function renderWithAnim() {
    _origRender();
    setTimeout(_animateBars, 200);
  }

  return { render: renderWithAnim, refreshTips, updateGoal, logStudySession };
})();
