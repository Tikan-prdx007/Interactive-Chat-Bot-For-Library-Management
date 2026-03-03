// ─── Chat Module ─────────────────────────────────────────────────────────────

const ChatModule = (() => {

    function render() {
        const s = AppState.student;
        const panel = document.getElementById("panel-chat");
        panel.innerHTML = `
      <div class="panel-header">
        <h2>💬 AI Chat Assistant</h2>
        <p class="panel-sub">Ask me anything — books, topics, progress, or just say hi!</p>
      </div>
      <div class="chat-wrap">
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-quick-btns">
          <button class="qbtn" onclick="ChatModule.send('Find me a book on algorithms')">📚 Find book</button>
          <button class="qbtn" onclick="ChatModule.send('Show my progress')">📊 My progress</button>
          <button class="qbtn" onclick="ChatModule.send('Explain recursion to me')">🧠 Explain topic</button>
          <button class="qbtn" onclick="ChatModule.send('Give me a motivational quote')">💪 Motivate me</button>
        </div>
        <div class="chat-input-row">
          <input type="text" id="chat-input" placeholder="Type a message..." class="chat-input"
            onkeydown="if(event.key==='Enter')ChatModule.sendInput()" />
          <button class="btn btn-reserve" onclick="ChatModule.sendInput()">Send ➤</button>
        </div>
      </div>`;
        loadHistory();
        if (AppState.chatHistory.length === 0) {
            const greeted = sessionStorage.getItem("greeted");
            if (!greeted) {
                const hr = new Date().getHours();
                const time = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
                addMessage("bot", `${time}, <strong>${s.name}</strong>! 👋 You've studied <strong>${s.studyHoursWeek} hrs</strong> this week and your streak is <strong>${s.streak} days</strong>. 🔥 What would you like to do today?`);
                sessionStorage.setItem("greeted", "1");
            }
        }
    }

    function loadHistory() {
        const container = document.getElementById("chat-messages");
        if (!container) return;
        AppState.chatHistory.slice(-30).forEach(m => {
            const div = document.createElement("div");
            div.className = `chat-msg ${m.role}`;
            div.innerHTML = `<div class="msg-bubble">${m.text}</div><div class="msg-time">${m.time}</div>`;
            container.appendChild(div);
        });
        container.scrollTop = container.scrollHeight;
    }

    function addMessage(role, text) {
        const container = document.getElementById("chat-messages");
        if (!container) return;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const div = document.createElement("div");
        div.className = `chat-msg ${role}`;
        div.innerHTML = `<div class="msg-bubble">${text}</div><div class="msg-time">${time}</div>`;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
        if (role !== "typing") {
            AppState.chatHistory.push({ role, text, time });
            if (AppState.chatHistory.length > 100) AppState.chatHistory.shift();
            AppState.save();
        }
    }

    function showTyping() {
        const container = document.getElementById("chat-messages");
        const t = document.createElement("div");
        t.className = "chat-msg bot typing-indicator";
        t.id = "typing-bubble";
        t.innerHTML = `<div class="msg-bubble"><span></span><span></span><span></span></div>`;
        container.appendChild(t);
        container.scrollTop = container.scrollHeight;
    }

    function removeTyping() {
        const t = document.getElementById("typing-bubble");
        if (t) t.remove();
    }

    function sendInput() {
        const input = document.getElementById("chat-input");
        if (!input) return;
        const val = input.value.trim();
        if (!val) return;
        input.value = "";
        send(val);
    }

    function send(text) {
        addMessage("user", text);
        showTyping();
        setTimeout(() => {
            removeTyping();
            const reply = generateReply(text);
            addMessage("bot", reply.text);
            if (reply.navigate) setTimeout(() => App.navigate(reply.navigate), 800);
        }, 900 + Math.random() * 600);
    }

    function pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)].replace("{name}", AppState.student.name);
    }

    function generateReply(text) {
        const t = text.toLowerCase();
        const name = AppState.student.name;
        const s = AppState.student;

        if (/hi|hello|hey|good morning|good evening|good afternoon/.test(t)) {
            return { text: pick(CHAT_RESPONSES.greet) };
        }
        if (/book|find|search|title|author|library|shelf|reserve|available/.test(t)) {
            const matches = LIBRARY_BOOKS.filter(b => t.includes(b.subject.toLowerCase()) || t.includes(b.title.toLowerCase().substring(0, 6)));
            if (matches.length) {
                const b = matches[0];
                return { text: `I found "${b.title}" by ${b.author} on Shelf ${b.shelf}. It's currently ${b.available ? '✅ Available' : '⏳ Issued'}. Want me to take you to the Library to reserve it?`, navigate: "library" };
            }
            return { text: `Let me open the Library for you, ${name}! You can search any book by title, author, or subject. 📚`, navigate: "library" };
        }
        if (/progress|dashboard|stats|score|quiz|average|streak|hours|performance/.test(t)) {
            return { text: `Here's your quick snapshot, ${name}! 📊<br><br>📅 Study Hours: <strong>${s.studyHoursWeek} hrs</strong><br>🎯 Quiz Avg: <strong>${s.quizAvg}%</strong><br>🔥 Streak: <strong>${s.streak} days</strong><br>⭐ XP: <strong>${s.xp}</strong><br><br>Opening your dashboard now!`, navigate: "dashboard" };
        }
        if (/explain|teach|learn|what is|how does|understand|topic|recursion|stack|queue|array|binary|oop/.test(t)) {
            const topicGuess = Object.keys(TOPICS).find(tp => t.includes(tp.toLowerCase().split(" ")[0]));
            if (topicGuess) {
                return { text: `Great question, ${name}! Let me explain <strong>${topicGuess}</strong>. Opening the Tutor module now...`, navigate: "tutor" };
            }
            return { text: `I'd love to be your tutor, ${name}! 🧠 Head to the Tutor section to pick a topic and get a full explanation + quiz!`, navigate: "tutor" };
        }
        if (/quiz|test|practice|question/.test(t)) {
            return { text: `Quiz time, ${name}! 🎯 Let me take you to the Tutor section where you can pick any topic and take a quiz!`, navigate: "tutor" };
        }
        if (/motivat|encourage|inspire|cheer|feel|tired|stressed/.test(t)) {
            const quotes = [
                `You've got this, ${name}! 💪 Every expert was once a beginner. Keep going!`,
                `${name}, you've studied ${s.studyHoursTotal}+ hours total. That's incredible consistency! 🚀`,
                `"Success is the sum of small efforts repeated day in and day out." — Keep pushing, ${name}! ⭐`,
                `Your ${s.streak}-day streak is proof that you're serious about growth. Never stop! 🔥`,
            ];
            return { text: quotes[Math.floor(Math.random() * quotes.length)] };
        }
        if (/badge|achievement|level|xp/.test(t)) {
            return { text: `You currently have <strong>${s.badges.length} badges</strong> and <strong>${s.xp} XP</strong> as a <strong>${Gamification.getLevelInfo(s.xp).name}</strong>. Keep studying to unlock more! 🏅` };
        }
        if (/recommend|suggest|what should i/.test(t)) {
            const weak = Object.entries(s.subjectScores).sort((a, b) => a[1] - b[1])[0][0];
            const book = LIBRARY_BOOKS.find(b => b.subject.toLowerCase().includes(weak.toLowerCase()) && b.available) || LIBRARY_BOOKS[0];
            return { text: `📌 Based on your performance, I recommend:<br><br>📚 Book: <strong>${book.title}</strong> (${book.subject})<br>🧠 Topic: Focus on <strong>${weak}</strong> — your score there needs a boost<br>🎯 Practice: Take a quiz in the Tutor module today!` };
        }
        return { text: pick(CHAT_RESPONSES.unknown) };
    }

    return { render, send, sendInput };
})();
