// ─── Gamification Module ─────────────────────────────────────────────────────

const Gamification = (() => {

  function getLevelInfo(xp) {
    let current = LEVELS[0];
    for (const lvl of LEVELS) {
      if (xp >= lvl.minXP) current = lvl;
    }
    const idx  = LEVELS.indexOf(current);
    const next = LEVELS[idx + 1] || null;
    const progress = next
      ? Math.round(((xp - current.minXP) / (next.minXP - current.minXP)) * 100)
      : 100;
    return { ...current, next, progress };
  }

  function awardXP(amount) {
    const student = AppState.student;
    const before  = getLevelInfo(student.xp).name;
    student.xp   += amount;
    const after   = getLevelInfo(student.xp).name;
    AppState.save();
    if (before !== after) {
      showToast(`🎉 Level Up! You are now a <strong>${after}</strong>!`, "gold");
    }
    renderXPBar();
  }

  function checkAndAwardBadge(badgeId) {
    const student = AppState.student;
    const badge   = BADGES_CONFIG.find(b => b.id === badgeId);
    if (!badge) return;
    const alreadyHas = student.badges.some(b => b.includes(badge.name));
    if (alreadyHas) return;
    student.badges.push(`${badge.emoji} ${badge.name}`);
    awardXP(badge.xp);
    AppState.save();
    showBadgePopup(badge);
  }

  // ── Quiz-specific badge checks ─────────────────────────────────────────────
  function checkQuizBadges(score, total) {
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
    checkAndAwardBadge("first_quiz");
    if (accuracy >= 80)  checkAndAwardBadge("quick_learner");
    if (accuracy >= 90)  checkAndAwardBadge("accuracy_ace");
    if (accuracy === 100) checkAndAwardBadge("quiz_ace");
  }

  function checkStreakBadge() {
    const s = AppState.student;
    if (s.streak >= 3)  checkAndAwardBadge("streak_3");
    if (s.streak >= 5)  checkAndAwardBadge("focused_learner");
    if (s.topicsCovered >= 15) checkAndAwardBadge("scholar");
  }

  // ── Record study time (adds to activityLog + dailyGoals) ──────────────────
  function recordStudyTime(mins) {
    const s    = AppState.student;
    const date = new Date().toDateString();

    // Daily goal reset check
    if (!s.dailyGoals) s.dailyGoals = { studyMins: 30, quizCount: 2, studyDone: 0, quizDone: 0, lastGoalDate: null };
    if (s.dailyGoals.lastGoalDate !== date) {
      s.dailyGoals.studyDone = 0;
      s.dailyGoals.quizDone  = 0;
      s.dailyGoals.lastGoalDate = date;
    }
    s.dailyGoals.studyDone += mins;

    // Activity log
    if (!s.activityLog) s.activityLog = [];
    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
    const existing = s.activityLog.find(e => e.date === today);
    if (existing) existing.studyMins += mins;
    else s.activityLog.push({ date: today, studyMins: mins });
    if (s.activityLog.length > 30) s.activityLog.shift();

    // Weekly hours
    s.studyHoursWeek = parseFloat((s.studyHoursWeek + mins / 60).toFixed(1));
    s.studyHoursTotal = parseFloat((s.studyHoursTotal + mins / 60).toFixed(1));

    // Weekday bucket (0=Mon)
    const dow = (new Date().getDay() + 6) % 7; // 0=Mon
    if (!s.weeklyHours) s.weeklyHours = [0,0,0,0,0,0,0];
    s.weeklyHours[dow] = parseFloat((s.weeklyHours[dow] + mins / 60).toFixed(1));

    AppState.save();
    showToast(`⏱️ +${mins} min logged! Keep it up!`, "info");

    // Check daily hero
    if (s.dailyGoals.studyDone >= s.dailyGoals.studyMins &&
        s.dailyGoals.quizDone  >= s.dailyGoals.quizCount) {
      checkAndAwardBadge("daily_hero");
      showToast("🦸 Daily goals complete! You earned the Daily Hero badge!", "gold");
    }
  }

  function showBadgePopup(badge) {
    const popup = document.createElement("div");
    popup.className = "badge-popup";
    popup.innerHTML = `
      <div class="badge-popup-inner">
        <div class="badge-icon">${badge.emoji}</div>
        <div>
          <div class="badge-title">Badge Unlocked!</div>
          <div class="badge-name">${badge.name}</div>
          <div class="badge-desc">${badge.desc}</div>
          <div class="badge-xp">+${badge.xp} XP</div>
        </div>
      </div>`;
    document.body.appendChild(popup);
    setTimeout(() => popup.classList.add("show"), 50);
    setTimeout(() => { popup.classList.remove("show"); setTimeout(() => popup.remove(), 500); }, 4000);
  }

  function showToast(msg, type = "info") {
    const t = document.createElement("div");
    t.className = `toast toast-${type}`;
    t.innerHTML = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add("show"), 50);
    setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 400); }, 3500);
  }

  function renderXPBar() {
    const student = AppState.student;
    const info    = getLevelInfo(student.xp);
    const bar     = document.getElementById("xp-bar");
    const label   = document.getElementById("xp-label");
    const lvlEl   = document.getElementById("player-level");
    if (bar)   bar.style.width = info.progress + "%";
    if (label) label.textContent = `${student.xp} XP — ${info.name}${info.next ? ' → ' + info.next.name : ' (MAX)'}`;
    if (lvlEl) lvlEl.textContent = info.name;
  }

  return { getLevelInfo, awardXP, checkAndAwardBadge, checkQuizBadges, checkStreakBadge, recordStudyTime, renderXPBar, showToast };
})();

