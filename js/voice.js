// ─── Voice Module ─────────────────────────────────────────────────────────────

const VoiceModule = (() => {

  let recognition = null;
  let listening = false;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  function render() {
    const supported = !!SpeechRecognition;
    const panel = document.getElementById("panel-voice");
    panel.innerHTML = `
      <div class="panel-header">
        <h2>🎤 Voice Mode</h2>
        <p class="panel-sub">Speak to SHELFBOT hands-free</p>
      </div>
      ${!supported ? `<div class="voice-unsupported">⚠️ Your browser does not support Voice Recognition. Please use Google Chrome for this feature.</div>` : ""}
      <div class="voice-orb-wrap">
        <div class="voice-orb ${supported ? 'orb-ready' : 'orb-off'}" id="voice-orb" onclick="${supported ? 'VoiceModule.toggle()' : ''}">
          <span class="orb-icon">${supported ? "🎤" : "🚫"}</span>
        </div>
        <div class="voice-status" id="voice-status">${supported ? "Tap the microphone to speak" : "Voice not supported"}</div>
      </div>
      <div class="voice-transcript-wrap">
        <div class="voice-label">📝 Transcript</div>
        <div class="voice-transcript" id="voice-transcript">Your speech will appear here...</div>
      </div>
      <div class="voice-response-wrap">
        <div class="voice-label">🤖 SHELFBOT's Response</div>
        <div class="voice-response" id="voice-response">Waiting for your question...</div>
      </div>
      <div class="voice-tips">
        <div class="voice-tip-title">💡 Try saying:</div>
        <div class="voice-tips-grid">
          <span class="voice-chip" onclick="VoiceModule.simulateSpeech('Find me a book on Python')">Find me a book on Python</span>
          <span class="voice-chip" onclick="VoiceModule.simulateSpeech('Show my study progress')">Show my study progress</span>
          <span class="voice-chip" onclick="VoiceModule.simulateSpeech('Explain recursion')">Explain recursion</span>
          <span class="voice-chip" onclick="VoiceModule.simulateSpeech('Give me a motivational quote')">Motivate me</span>
        </div>
      </div>`;
  }

  function toggle() {
    if (listening) { stopListening(); } else { startListening(); }
  }

  function startListening() {
    if (!SpeechRecognition) return;
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      listening = true;
      document.getElementById("voice-orb").classList.add("orb-active");
      document.getElementById("voice-status").textContent = "🔴 Listening... speak now";
    };

    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join("");
      document.getElementById("voice-transcript").textContent = transcript;
      if (e.results[e.results.length - 1].isFinal) {
        processVoiceInput(transcript);
      }
    };

    recognition.onerror = (e) => {
      document.getElementById("voice-status").textContent = `⚠️ Error: ${e.error}. Try again.`;
      stopListening();
    };

    recognition.onend = () => { listening = false; };
    recognition.start();
  }

  function stopListening() {
    if (recognition) { recognition.stop(); recognition = null; }
    listening = false;
    const orb = document.getElementById("voice-orb");
    if (orb) orb.classList.remove("orb-active");
    const status = document.getElementById("voice-status");
    if (status) status.textContent = "Tap to speak again";
  }

  function processVoiceInput(text) {
    stopListening();
    document.getElementById("voice-status").textContent = "⚙️ Processing...";
    const reply = ChatModule.generateReplyText(text);
    const responseEl = document.getElementById("voice-response");
    if (responseEl) {
      responseEl.innerHTML = `<strong>You said:</strong> "${text}"<br><br><strong>SHELFBOT:</strong> ${reply.text}`;
    }
    speak(reply.text.replace(/<[^>]+>/g, ""));
    setTimeout(() => {
      if (document.getElementById("voice-status"))
        document.getElementById("voice-status").textContent = "Tap the microphone to speak again";
    }, 500);
  }

  function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "en-US";
    utt.rate = 1.0;
    utt.pitch = 1.1;
    window.speechSynthesis.speak(utt);
  }

  function simulateSpeech(text) {
    document.getElementById("voice-transcript").textContent = text;
    processVoiceInput(text);
  }

  return { render, toggle, simulateSpeech };
})();
