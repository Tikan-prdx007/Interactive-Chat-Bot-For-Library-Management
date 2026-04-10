// ─── Daily Quiz Module ────────────────────────────────────────────────────────

const QuizModule = (() => {

  // ── State ──────────────────────────────────────────────────────────────────
  let _questions  = [];
  let _current    = 0;
  let _score      = 0;
  let _answers    = []; // { selected, correct, isCorrect }
  let _subject    = "Mixed";
  let _timerInt   = null;
  let _timeLeft   = 30;
  let _quizActive = false;
  let _loading    = false;

  const SUBJECTS = ["Mixed", "Academic", "Books", "General Knowledge"];
  const Q_COUNT  = 7; // questions per quiz

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER — Quiz panel entry screen
  // ─────────────────────────────────────────────────────────────────────────
  function render() {
    const s     = AppState.student;
    const panel = document.getElementById("panel-quiz");
    if (!panel) return;

    _resetState();

    const totalAcc = s.quizQuestions > 0
      ? Math.round((s.quizCorrect / s.quizQuestions) * 100)
      : 0;

    panel.innerHTML = `
      <div class="quiz-shell">

        <!-- Header -->
        <div class="quiz-header">
          <div class="quiz-header-left">
            <div class="quiz-icon-orb">🧠</div>
            <div>
              <div class="quiz-title">Daily Quiz</div>
              <div class="quiz-subtitle">Test your knowledge · Earn XP · Unlock Badges</div>
            </div>
          </div>
          <div class="quiz-header-stats">
            <div class="qhs-item">
              <span class="qhs-val">${s.quizTotal}</span>
              <span class="qhs-lbl">Quizzes</span>
            </div>
            <div class="qhs-item">
              <span class="qhs-val">${s.quizAvg}%</span>
              <span class="qhs-lbl">Avg Score</span>
            </div>
            <div class="qhs-item">
              <span class="qhs-val">${totalAcc}%</span>
              <span class="qhs-lbl">Accuracy</span>
            </div>
          </div>
        </div>

        <!-- Category Picker -->
        <div class="quiz-category-section">
          <div class="qcat-label">Choose a category</div>
          <div class="qcat-grid">
            ${SUBJECTS.map(sub => `
              <button class="qcat-btn${sub === _subject ? ' active' : ''}"
                id="qcat-${sub.replace(/\s/g,'')}"
                onclick="QuizModule.selectCategory('${sub}')">
                <span class="qcat-icon">${_catIcon(sub)}</span>
                <span class="qcat-name">${sub}</span>
              </button>`).join("")}
          </div>
        </div>

        <!-- Recent History -->
        <div class="quiz-history-section">
          <div class="qh-label">📋 Recent Quiz Results</div>
          <div class="qh-list" id="quiz-history-list">
            ${_renderHistory(s.quizHistory)}
          </div>
        </div>

        <!-- Start Button -->
        <div class="quiz-start-wrap">
          <button class="quiz-start-btn" id="quiz-start-btn" onclick="QuizModule.startQuiz()">
            <span>🚀 Start Quiz</span>
            <span class="quiz-start-sub">${Q_COUNT} questions · ${Q_COUNT * 30}s</span>
          </button>
        </div>

        <!-- Quiz Arena (hidden initially) -->
        <div class="quiz-arena" id="quiz-arena" style="display:none"></div>

      </div>`;
  }

  function _catIcon(sub) {
    const icons = { "Mixed": "🎲", "Academic": "📐", "Books": "📚", "General Knowledge": "🌍" };
    return icons[sub] || "🎯";
  }

  function _renderHistory(history) {
    if (!history || !history.length)
      return `<div class="qh-empty">No quizzes yet — start one above! 🎯</div>`;
    return history.slice(-5).reverse().map(h => `
      <div class="qh-item">
        <span class="qh-subject">${h.subject}</span>
        <span class="qh-score ${h.accuracy >= 80 ? 'good' : h.accuracy >= 60 ? 'ok' : 'low'}">${h.score}/${h.total}</span>
        <span class="qh-acc">${h.accuracy}%</span>
        <span class="qh-date">${h.date}</span>
      </div>`).join("");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CATEGORY SELECT
  // ─────────────────────────────────────────────────────────────────────────
  function selectCategory(sub) {
    _subject = sub;
    document.querySelectorAll(".qcat-btn").forEach(b => b.classList.remove("active"));
    const btn = document.getElementById(`qcat-${sub.replace(/\s/g, "")}`);
    if (btn) btn.classList.add("active");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // START QUIZ
  // ─────────────────────────────────────────────────────────────────────────
  async function startQuiz() {
    if (_loading || _quizActive) return;
    _loading = true;
    _resetState();

    const startBtn = document.getElementById("quiz-start-btn");
    if (startBtn) { startBtn.disabled = true; startBtn.innerHTML = `<span>⏳ Generating questions…</span>`; }

    // Try backend first, fall back to local bank
    _questions = await _fetchQuestions(_subject);
    _quizActive = true;
    _loading    = false;

    const arena = document.getElementById("quiz-arena");
    const shell = document.querySelector(".quiz-shell");
    if (arena && shell) {
      // Hide everything except arena
      shell.querySelectorAll(":scope > :not(#quiz-arena)").forEach(el => el.style.display = "none");
      arena.style.display = "block";
    }

    _showQuestion();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH QUESTIONS from backend → fallback to local bank
  // ─────────────────────────────────────────────────────────────────────────
  async function _fetchQuestions(subject) {
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, count: Q_COUNT }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (data.questions && data.questions.length >= 3) return data.questions;
    } catch (e) {
      console.warn("[QuizModule] Backend quiz fetch failed, using local bank:", e.message);
    }
    return _localQuestions(subject);
  }

  function _localQuestions(subject) {
    let pool = [];
    if (subject === "Mixed") {
      Object.values(QUIZ_QUESTION_BANK).forEach(arr => pool.push(...arr));
    } else if (QUIZ_QUESTION_BANK[subject]) {
      pool = [...QUIZ_QUESTION_BANK[subject]];
    } else {
      Object.values(QUIZ_QUESTION_BANK).forEach(arr => pool.push(...arr));
    }
    // Shuffle and pick Q_COUNT
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, Q_COUNT);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SHOW QUESTION
  // ─────────────────────────────────────────────────────────────────────────
  function _showQuestion() {
    _stopTimer();
    _timeLeft = 30;

    const q     = _questions[_current];
    const arena = document.getElementById("quiz-arena");
    if (!arena || !q) return;

    const pct = ((_current) / _questions.length) * 100;
    const optLabels = ["A", "B", "C", "D"];

    arena.innerHTML = `
      <div class="qa-progress-bar">
        <div class="qa-prog-fill" style="width:${pct}%"></div>
      </div>

      <div class="qa-meta">
        <span class="qa-counter">Question ${_current + 1} of ${_questions.length}</span>
        <span class="qa-subject-tag">${_catIcon(_subject)} ${_subject}</span>
        <span class="qa-score-live">Score: ${_score}/${_current}</span>
      </div>

      <!-- Timer Ring -->
      <div class="qa-timer-ring" id="qa-timer-ring">
        <svg viewBox="0 0 80 80">
          <circle class="timer-track" cx="40" cy="40" r="34"/>
          <circle class="timer-fill" id="timer-circle" cx="40" cy="40" r="34"
            stroke-dasharray="${2 * Math.PI * 34}"
            stroke-dashoffset="0"/>
        </svg>
        <div class="timer-text" id="timer-text">30</div>
      </div>

      <!-- Question -->
      <div class="qa-question-card">
        <div class="qa-q-num">Q${_current + 1}</div>
        <div class="qa-q-text">${q.question}</div>
      </div>

      <!-- Options -->
      <div class="qa-options-grid" id="qa-options">
        ${q.options.map((opt, i) => `
          <button class="qa-option" id="qa-opt-${i}"
            onclick="QuizModule.selectAnswer(${i})">
            <span class="qa-opt-label">${optLabels[i]}</span>
            <span class="qa-opt-text">${opt}</span>
          </button>`).join("")}
      </div>

      <!-- Explanation (hidden until answered) -->
      <div class="qa-explanation" id="qa-explanation" style="display:none">
        <div class="qa-expl-inner">
          <span class="qa-expl-icon" id="qa-expl-icon">💡</span>
          <div id="qa-expl-text"></div>
        </div>
      </div>

      <!-- Next Button (shown after answer) -->
      <div class="qa-next-wrap" id="qa-next-wrap" style="display:none">
        <button class="qa-next-btn" onclick="QuizModule.nextQuestion()">
          ${_current + 1 === _questions.length ? "📊 See Results" : "Next Question →"}
        </button>
      </div>`;

    _startTimer();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TIMER
  // ─────────────────────────────────────────────────────────────────────────
  function _startTimer() {
    const circumference = 2 * Math.PI * 34;
    _timerInt = setInterval(() => {
      _timeLeft--;
      const circle = document.getElementById("timer-circle");
      const label  = document.getElementById("timer-text");
      if (circle) {
        const offset = circumference * (1 - _timeLeft / 30);
        circle.style.strokeDashoffset = offset;
        if (_timeLeft <= 10) circle.style.stroke = "#ef4444";
        else if (_timeLeft <= 20) circle.style.stroke = "#f59e0b";
      }
      if (label) {
        label.textContent = _timeLeft;
        if (_timeLeft <= 5) label.style.color = "#ef4444";
      }
      if (_timeLeft <= 0) {
        _stopTimer();
        selectAnswer(-1); // timeout = wrong
      }
    }, 1000);
  }

  function _stopTimer() {
    if (_timerInt) { clearInterval(_timerInt); _timerInt = null; }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SELECT ANSWER
  // ─────────────────────────────────────────────────────────────────────────
  function selectAnswer(selectedIdx) {
    _stopTimer();
    const q       = _questions[_current];
    const correct = q.correct;
    const isRight = selectedIdx === correct;

    if (isRight) _score++;
    _answers.push({ selected: selectedIdx, correct, isCorrect: isRight });

    // Highlight options
    const opts = document.querySelectorAll(".qa-option");
    opts.forEach((btn, i) => {
      btn.disabled = true;
      if (i === correct) btn.classList.add("qa-opt-correct");
      else if (i === selectedIdx && !isRight) btn.classList.add("qa-opt-wrong");
    });

    // Flash ring color
    const ring = document.getElementById("qa-timer-ring");
    if (ring) ring.classList.add(isRight ? "ring-success" : "ring-fail");

    // Show explanation
    if (q.explanation) {
      const expl     = document.getElementById("qa-explanation");
      const explText = document.getElementById("qa-expl-text");
      const explIcon = document.getElementById("qa-expl-icon");
      if (expl && explText) {
        explIcon.textContent = isRight ? "✅" : "❌";
        explText.innerHTML   = `<strong>${isRight ? "Correct!" : (selectedIdx === -1 ? "Time's up!" : "Incorrect.")}</strong> ${q.explanation}`;
        expl.style.display   = "block";
        expl.className       = `qa-explanation ${isRight ? "expl-correct" : "expl-wrong"}`;
      }
    }

    // Show next button
    const nextWrap = document.getElementById("qa-next-wrap");
    if (nextWrap) nextWrap.style.display = "block";
  }

  // ─────────────────────────────────────────────────────────────────────────
  // NEXT QUESTION
  // ─────────────────────────────────────────────────────────────────────────
  function nextQuestion() {
    _current++;
    if (_current >= _questions.length) {
      _showResults();
    } else {
      _showQuestion();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RESULTS SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  function _showResults() {
    _quizActive = false;
    const accuracy = Math.round((_score / _questions.length) * 100);
    const xpEarned = _score * 10 + (accuracy >= 90 ? 20 : accuracy >= 80 ? 10 : 0);

    // Persist to AppState
    _saveResults(accuracy, xpEarned);

    const grade   = accuracy >= 90 ? "🏆 Outstanding!" : accuracy >= 80 ? "⭐ Great job!" : accuracy >= 60 ? "👍 Good effort!" : "💪 Keep practicing!";
    const gradeClr= accuracy >= 80 ? "var(--accent-green)" : accuracy >= 60 ? "var(--accent-yellow)" : "var(--accent-red)";

    const arena = document.getElementById("quiz-arena");
    if (!arena) return;

    arena.innerHTML = `
      <div class="qa-results">
        <div class="qa-res-fireworks" id="qa-fireworks"></div>

        <div class="qa-res-score-ring">
          <svg viewBox="0 0 120 120">
            <circle class="res-track" cx="60" cy="60" r="50"/>
            <circle class="res-fill" cx="60" cy="60" r="50"
              stroke="${gradeClr}"
              stroke-dasharray="${2 * Math.PI * 50}"
              stroke-dashoffset="${2 * Math.PI * 50 * (1 - accuracy / 100)}"
              style="transition:stroke-dashoffset 1.2s ease"/>
          </svg>
          <div class="qa-res-pct">${accuracy}%</div>
        </div>

        <div class="qa-res-grade">${grade}</div>
        <div class="qa-res-breakdown">
          <span>✅ ${_score} correct</span>
          <span>❌ ${_questions.length - _score} wrong</span>
        </div>

        <div class="qa-res-xp">+${xpEarned} XP earned</div>

        <!-- Answer Review -->
        <div class="qa-review-section">
          <div class="qa-rev-title">📋 Answer Review</div>
          <div class="qa-rev-list">
            ${_questions.map((q, i) => {
              const ans    = _answers[i];
              const ok     = ans?.isCorrect;
              const sel    = ans?.selected;
              return `<div class="qa-rev-item ${ok ? 'rev-ok' : 'rev-fail'}">
                <span class="qa-rev-num">Q${i+1}</span>
                <span class="qa-rev-q">${q.question}</span>
                <span class="qa-rev-a">${ok ? '✅' : '❌'} ${q.options[q.correct]}</span>
                ${!ok && sel !== undefined && sel >= 0 ? `<span class="qa-rev-yours">Your answer: ${q.options[sel] || "Timed out"}</span>` : ''}
              </div>`;
            }).join("")}
          </div>
        </div>

        <div class="qa-res-actions">
          <button class="qa-btn-retry" onclick="QuizModule.retryQuiz()">🔄 Try Again</button>
          <button class="qa-btn-new" onclick="QuizModule.render()">🎲 New Category</button>
          <button class="qa-btn-dash" onclick="App.navigate('dashboard')">📊 View Dashboard</button>
        </div>
      </div>`;

    // Animate score ring
    setTimeout(() => {
      const fill = arena.querySelector(".res-fill");
      if (fill) fill.style.strokeDashoffset =
        String(2 * Math.PI * 50 * (1 - accuracy / 100));
    }, 100);

    _launchFireworks(accuracy);
  }

  function _launchFireworks(accuracy) {
    if (accuracy < 60) return;
    const fw  = document.getElementById("qa-fireworks");
    if (!fw) return;
    const colors = ["#6c63ff", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#ec4899"];
    for (let i = 0; i < (accuracy >= 90 ? 30 : 15); i++) {
      setTimeout(() => {
        const dot = document.createElement("div");
        dot.className    = "fw-dot";
        dot.style.left   = `${Math.random() * 100}%`;
        dot.style.background = colors[Math.floor(Math.random() * colors.length)];
        dot.style.animationDuration = `${0.6 + Math.random() * 0.8}s`;
        dot.style.animationDelay   = `${Math.random() * 0.3}s`;
        fw.appendChild(dot);
        setTimeout(() => dot.remove(), 1500);
      }, i * 60);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SAVE RESULTS
  // ─────────────────────────────────────────────────────────────────────────
  function _saveResults(accuracy, xpEarned) {
    const s    = AppState.student;
    const date = new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" });

    // Update quiz stats
    s.quizTotal++;
    s.quizCorrect  = (s.quizCorrect  || 0) + _score;
    s.quizQuestions= (s.quizQuestions|| 0) + _questions.length;
    s.quizAvg      = Math.round((s.quizCorrect / s.quizQuestions) * 100);

    // Update subject accuracy
    if (!s.subjectAccuracy) s.subjectAccuracy = {};
    const subKey = _subject === "Mixed" ? "Mixed" : _subject;
    if (!s.subjectAccuracy[subKey]) s.subjectAccuracy[subKey] = { correct: 0, total: 0 };
    s.subjectAccuracy[subKey].correct += _score;
    s.subjectAccuracy[subKey].total   += _questions.length;

    // Push to history
    s.quizHistory.push({ subject: _subject, score: _score, total: _questions.length, accuracy, date, xpEarned });
    if (s.quizHistory.length > 50) s.quizHistory.shift();

    // Daily goal
    if (!s.dailyGoals) s.dailyGoals = { studyMins: 30, quizCount: 2, studyDone: 0, quizDone: 0, lastGoalDate: null };
    const today = new Date().toDateString();
    if (s.dailyGoals.lastGoalDate !== today) {
      s.dailyGoals.quizDone = 0; s.dailyGoals.studyDone = 0; s.dailyGoals.lastGoalDate = today;
    }
    s.dailyGoals.quizDone++;

    AppState.save();

    // XP & Badges
    Gamification.awardXP(xpEarned);
    Gamification.checkAndAwardBadge("first_quiz");
    if (accuracy >= 80) Gamification.checkAndAwardBadge("quick_learner");
    if (accuracy >= 90) Gamification.checkAndAwardBadge("accuracy_ace");
    if (accuracy === 100) Gamification.checkAndAwardBadge("quiz_ace");
    if (s.streak >= 3) Gamification.checkAndAwardBadge("streak_3");

    // Check daily hero
    if (s.dailyGoals.quizDone >= s.dailyGoals.quizCount &&
        s.dailyGoals.studyDone >= s.dailyGoals.studyMins) {
      Gamification.checkAndAwardBadge("daily_hero");
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RETRY
  // ─────────────────────────────────────────────────────────────────────────
  function retryQuiz() {
    _resetState();
    startQuiz();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RESET
  // ─────────────────────────────────────────────────────────────────────────
  function _resetState() {
    _stopTimer();
    _questions  = [];
    _current    = 0;
    _score      = 0;
    _answers    = [];
    _timeLeft   = 30;
    _quizActive = false;
    _loading    = false;
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  return { render, startQuiz, selectCategory, selectAnswer, nextQuestion, retryQuiz };

})();
