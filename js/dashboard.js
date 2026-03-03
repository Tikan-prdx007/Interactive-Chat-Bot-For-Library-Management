// ─── Dashboard Module ─────────────────────────────────────────────────────────

const DashboardModule = (() => {

    function render() {
        const s = AppState.student;
        const info = Gamification.getLevelInfo(s.xp);
        const strongSubject = Object.entries(s.subjectScores).sort((a, b) => b[1] - a[1])[0];
        const weakSubject = Object.entries(s.subjectScores).sort((a, b) => a[1] - b[1])[0];
        const motivations = [
            `You studied ${s.studyHoursWeek} hours this week — keep the momentum! 🚀`,
            `Your streak is ${s.streak} days! Consistency is the key to mastery. 🔥`,
            `${strongSubject[0]} is your strongest area. Let's now push ${weakSubject[0]}! 💪`,
            `Every topic you cover brings you closer to your goals. Keep going! ⭐`,
        ];
        const tip = `Focus on <strong>${weakSubject[0]}</strong> today — your score is ${weakSubject[1]}%. Try solving 3 practice problems.`;
        const mot = motivations[Math.floor(Math.random() * motivations.length)];
        const panel = document.getElementById("panel-dashboard");
        panel.innerHTML = `
      <div class="panel-header">
        <h2>📊 Your Study Dashboard</h2>
        <p class="panel-sub">Your personal academic analytics & insights</p>
      </div>
      <div class="dash-motivation-bar">
        <span>💬 ${mot}</span>
      </div>
      <div class="dash-cards">
        ${statCard("📅", "Study Hours (Week)", `${s.studyHoursWeek} hrs`, "blue")}
        ${statCard("📖", "Topics Covered", `${s.topicsCovered}`, "purple")}
        ${statCard("🎯", "Quiz Average", `${s.quizAvg}%`, s.quizAvg >= 75 ? "green" : "orange")}
        ${statCard("🔥", "Study Streak", `${s.streak} days`, "gold")}
        ${statCard("⭐", "Total XP", `${s.xp}`, "pink")}
        ${statCard("🏆", "Level", info.name, "teal")}
      </div>
      <div class="dash-two-col">
        <div class="dash-section">
          <h3>📈 Subject Performance</h3>
          <div class="subject-bars">${renderSubjectBars(s.subjectScores)}</div>
          <div class="perf-summary">
            <span class="perf-tag green">🥇 Strongest: ${strongSubject[0]} (${strongSubject[1]}%)</span>
            <span class="perf-tag red">⚠️ Needs Work: ${weakSubject[0]} (${weakSubject[1]}%)</span>
          </div>
        </div>
        <div class="dash-section">
          <h3>📅 Weekly Study Hours</h3>
          <div class="weekly-chart">${renderWeeklyChart(s.weeklyHours)}</div>
          <div class="weekly-total">Total: <strong>${s.studyHoursWeek} hrs</strong> this week</div>
        </div>
      </div>
      <div class="dash-two-col">
        <div class="dash-section" id="dash-badges">
          <h3>🏅 Your Badges</h3>
          <div class="badges-grid">${s.badges.map(b => `<div class="badge-pill">${b}</div>`).join("") || '<p class="muted">No badges yet. Start learning!</p>'}</div>
          <div class="xp-section">
            <div class="xp-label-row">
              <span>${info.name}</span>
              <span id="xp-label">${s.xp} XP → ${info.next ? info.next.name : "MAX"}</span>
            </div>
            <div class="xp-track"><div class="xp-fill" id="xp-bar" style="width:${info.progress}%"></div></div>
          </div>
        </div>
        <div class="dash-section">
          <h3>💡 Improvement Tip</h3>
          <div class="tip-card">${tip}</div>
          <h3 style="margin-top:1.5rem">🕐 Recent Topics</h3>
          <ul class="recent-topics">${s.recentTopics.map(t => `<li>📌 ${t}</li>`).join("")}</ul>
          <button class="btn btn-reserve" style="margin-top:1rem;width:100%" onclick="App.navigate('tutor')">🧠 Continue Learning →</button>
        </div>
      </div>`;
    }

    function statCard(icon, label, value, color) {
        return `<div class="stat-card stat-${color}">
      <div class="stat-icon">${icon}</div>
      <div class="stat-value">${value}</div>
      <div class="stat-label">${label}</div>
    </div>`;
    }

    function renderSubjectBars(scores) {
        return Object.entries(scores).map(([subj, score]) => {
            const color = score >= 80 ? "green" : score >= 60 ? "blue" : "orange";
            return `<div class="subj-bar-row">
        <span class="subj-name">${subj}</span>
        <div class="subj-track"><div class="subj-fill fill-${color}" style="width:${score}%" data-pct="${score}%"></div></div>
        <span class="subj-pct">${score}%</span>
      </div>`;
        }).join("");
    }

    function renderWeeklyChart(hours) {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const max = Math.max(...hours, 1);
        return `<div class="weekly-bars">` +
            hours.map((h, i) => `<div class="week-col">
        <div class="week-bar-wrap">
          <div class="week-bar" style="height:${Math.round((h / max) * 100)}%" title="${h}h"></div>
        </div>
        <div class="week-day">${days[i]}</div>
        <div class="week-h">${h}h</div>
      </div>`).join("") +
            `</div>`;
    }

    return { render };
})();
