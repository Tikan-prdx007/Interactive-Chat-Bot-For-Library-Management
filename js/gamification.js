// ─── Gamification Module ─────────────────────────────────────────────────────

const Gamification = (() => {

    function getLevelInfo(xp) {
        let current = LEVELS[0];
        for (const lvl of LEVELS) {
            if (xp >= lvl.minXP) current = lvl;
        }
        const idx = LEVELS.indexOf(current);
        const next = LEVELS[idx + 1] || null;
        const progress = next
            ? Math.round(((xp - current.minXP) / (next.minXP - current.minXP)) * 100)
            : 100;
        return { ...current, next, progress };
    }

    function awardXP(amount) {
        const student = AppState.student;
        const before = getLevelInfo(student.xp).name;
        student.xp += amount;
        const after = getLevelInfo(student.xp).name;
        AppState.save();
        if (before !== after) {
            showToast(`🎉 Level Up! You are now a <strong>${after}</strong>!`, "gold");
        }
    }

    function checkAndAwardBadge(badgeId) {
        const student = AppState.student;
        const badge = BADGES_CONFIG.find(b => b.id === badgeId);
        if (!badge) return;
        const alreadyHas = student.badges.some(b => b.includes(badge.name));
        if (alreadyHas) return;
        student.badges.push(`${badge.emoji} ${badge.name}`);
        awardXP(badge.xp);
        AppState.save();
        showBadgePopup(badge);
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
        const info = getLevelInfo(student.xp);
        const bar = document.getElementById("xp-bar");
        const label = document.getElementById("xp-label");
        const lvlEl = document.getElementById("player-level");
        if (bar) bar.style.width = info.progress + "%";
        if (label) label.textContent = `${student.xp} XP — ${info.name}${info.next ? ' → ' + info.next.name : ' (MAX)'}`;
        if (lvlEl) lvlEl.textContent = info.name;
    }

    return { getLevelInfo, awardXP, checkAndAwardBadge, renderXPBar, showToast };
})();
