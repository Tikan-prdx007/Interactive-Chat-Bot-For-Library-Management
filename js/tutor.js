// ─── Tutor Module ─────────────────────────────────────────────────────────────

const TutorModule = (() => {

    let activeTopic = null;
    let quizActive = false;
    let quizIdx = 0;
    let quizScore = 0;

    function render() {
        const s = AppState.student;
        const prev = s.recentTopics.length ? s.recentTopics[s.recentTopics.length - 1] : null;
        const panel = document.getElementById("panel-tutor");
        panel.innerHTML = `
      <div class="panel-header">
        <h2>🧠 Personal Tutor</h2>
        <p class="panel-sub">Select a topic for a personalized explanation, examples, and quiz</p>
      </div>
      ${prev ? `<div class="tutor-context-bar">📌 Last studied: <strong>${prev}</strong> — ready to build on that?</div>` : ""}
      <div class="topic-grid">${Object.keys(TOPICS).map(t => topicCard(t, prev)).join("")}</div>
      <div id="topic-content"></div>`;
    }

    function topicCard(name, recent) {
        const icons = { "Arrays": "🗃", "Stacks": "📦", "Queues": "🚂", "Recursion": "🔄", "Binary Search": "🔍", "OOP Concepts": "🏗" };
        const isRecent = recent && recent.includes(name.split(" ")[0]);
        return `<div class="topic-card ${isRecent ? 'topic-highlight' : ''}" onclick="TutorModule.selectTopic('${name}')">
      <div class="topic-icon">${icons[name] || "📝"}</div>
      <div class="topic-name">${name}</div>
      ${isRecent ? '<div class="topic-badge">Recent</div>' : ''}
    </div>`;
    }

    function selectTopic(name) {
        activeTopic = name;
        quizActive = false;
        quizIdx = 0;
        quizScore = 0;
        const s = AppState.student;
        const topic = TOPICS[name];
        if (!topic) return;

        // Track context memory
        if (!s.recentTopics.includes(name)) {
            s.recentTopics.unshift(name);
            if (s.recentTopics.length > 5) s.recentTopics.pop();
            s.topicsCovered++;
            AppState.save();
        }

        // Connection to previous topic
        const prev = s.recentTopics.find(t => t !== name);
        const connection = prev ? `<div class="tutor-connection">🔗 Previously, you studied <strong>${prev}</strong>. ${getConnection(prev, name)}</div>` : "";

        const content = document.getElementById("topic-content");
        content.innerHTML = `
      <div class="tutor-card">
        ${connection}
        <div class="tutor-section-title">💡 Simple Explanation</div>
        <p class="tutor-simple">${topic.simple}</p>
        <div class="tutor-section-title">⚙️ Technical Explanation</div>
        <p class="tutor-technical">${topic.technical}</p>
        <div class="tutor-section-title">🌍 Real-World Example</div>
        <p class="tutor-example">${topic.example}</p>
        <div class="tutor-section-title">💻 Code Example</div>
        <pre class="code-block">${topic.code}</pre>
        <div class="quiz-prompt">
          <span>🎯 Ready to test your understanding?</span>
          <button class="btn btn-reserve" onclick="TutorModule.startQuiz()">Start Quiz →</button>
        </div>
      </div>`;
        content.scrollIntoView({ behavior: "smooth" });
    }

    function getConnection(prev, current) {
        const map = {
            "Queues": { "Stacks": "Stacks are the opposite — LIFO instead of FIFO." },
            "Stacks": { "Queues": "Queues work opposite — FIFO. Both are linear structures." },
            "Arrays": { "Binary Search": "Binary Search requires sorted arrays, which you've already studied!" },
            "Recursion": { "Binary Search": "You can implement Binary Search recursively too — perfect connection!" },
        };
        return map[prev]?.[current] || "This topic builds on your existing knowledge. Let's connect the dots!";
    }

    function startQuiz() {
        quizActive = true;
        quizIdx = 0;
        quizScore = 0;
        renderQuestion();
    }

    function renderQuestion() {
        const topic = TOPICS[activeTopic];
        const q = topic.quiz[quizIdx];
        document.querySelector(".quiz-prompt").outerHTML;
        const content = document.getElementById("topic-content");
        content.querySelector(".quiz-prompt") && (content.querySelector(".quiz-prompt").style.display = "none");
        const existing = document.getElementById("quiz-section");
        if (existing) existing.remove();
        const div = document.createElement("div");
        div.id = "quiz-section";
        div.className = "quiz-section";
        div.innerHTML = `
      <div class="quiz-header">🎯 Quiz — Question ${quizIdx + 1} of ${topic.quiz.length}</div>
      <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${(quizIdx / topic.quiz.length) * 100}%"></div></div>
      <div class="quiz-question">${q.q}</div>
      <div class="quiz-options">
        ${q.opts.map((opt, i) => `<button class="quiz-opt" onclick="TutorModule.answer(${i})">${String.fromCharCode(65 + i)}. ${opt}</button>`).join("")}
      </div>`;
        content.appendChild(div);
        div.scrollIntoView({ behavior: "smooth" });
    }

    function answer(idx) {
        const topic = TOPICS[activeTopic];
        const q = topic.quiz[quizIdx];
        const correct = q.ans === idx;
        if (correct) quizScore++;
        const opts = document.querySelectorAll(".quiz-opt");
        opts.forEach((btn, i) => {
            btn.disabled = true;
            if (i === q.ans) btn.classList.add("correct");
            else if (i === idx && !correct) btn.classList.add("wrong");
        });
        const fb = document.createElement("div");
        fb.className = `quiz-feedback ${correct ? "fb-correct" : "fb-wrong"}`;
        fb.textContent = correct ? "✅ Correct! Well done!" : `❌ That's not right. The correct answer is ${String.fromCharCode(65 + q.ans)}.`;
        document.getElementById("quiz-section").appendChild(fb);
        setTimeout(() => {
            quizIdx++;
            if (quizIdx < topic.quiz.length) { renderQuestion(); }
            else { showResults(); }
        }, 1500);
    }

    function showResults() {
        const total = TOPICS[activeTopic].quiz.length;
        const pct = Math.round((quizScore / total) * 100);
        const name = AppState.student.name;
        // Update quiz average
        AppState.student.quizAvg = Math.round((AppState.student.quizAvg + pct) / 2);
        AppState.save();
        if (pct >= 80) Gamification.checkAndAwardBadge("quick_learner");
        if (pct === 100) Gamification.checkAndAwardBadge("quiz_ace");
        Gamification.awardXP(pct >= 80 ? 50 : 25);
        const div = document.getElementById("quiz-section");
        div.innerHTML = `
      <div class="quiz-result">
        <div class="result-emoji">${pct === 100 ? "🏆" : pct >= 80 ? "🎉" : pct >= 60 ? "👍" : "📚"}</div>
        <div class="result-score">${quizScore}/${total} — ${pct}%</div>
        <div class="result-msg">${pct === 100 ? `Perfect score, ${name}! Incredible! 🌟` : pct >= 80 ? `Great job, ${name}! You're mastering ${activeTopic}! 💪` : pct >= 60 ? `Good attempt, ${name}! Review the explanations and try again.` : `Keep practicing, ${name}! Read through the topic again and retry.`}</div>
        <button class="btn btn-reserve" onclick="TutorModule.startQuiz()">🔄 Retry Quiz</button>
        <button class="btn btn-return" onclick="TutorModule.render()" style="margin-left:.5rem">← Choose Another Topic</button>
      </div>`;
    }

    return { render, selectTopic, startQuiz, answer };
})();
