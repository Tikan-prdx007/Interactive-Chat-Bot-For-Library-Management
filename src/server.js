require("dotenv").config(); // must be first — loads OPENAI_API_KEY into process.env

const path = require("path");
const express = require("express");
const { exec } = require("child_process");

const { initDb, seedIfEmpty, ensureDefaultMemberProfile, DEFAULT_MEMBER_ID } = require("./db");
const { handleChat } = require("./chatbot");

const PORT = Number.parseInt(process.env.PORT || "5050", 10);
const ROOT = path.join(__dirname, ".."); // project root (where homepage.html etc. live)

// Groq client — shared for quiz & tips generation
const Groq = require("groq-sdk");
let _groqClient = null;
function getGroq() {
  if (!_groqClient && process.env.GROQ_API_KEY) {
    _groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groqClient;
}

// OpenAI TTS — only loaded if the key is configured
let openaiClient = null;
if (process.env.OPENAI_API_KEY) {
  try {
    const { OpenAI } = require("openai");
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log("✅ OpenAI TTS: enabled (premium AI voices)");
  } catch (e) {
    console.warn("⚠️  OpenAI SDK not available – TTS will use browser fallback:", e.message);
  }
} else {
  console.log("ℹ️  OpenAI TTS: no key set – browser TTS fallback active");
}

/** Opens a URL in the default system browser (cross-platform). */
function openBrowser(url) {
  const cmd =
    process.platform === "win32"  ? `start "" "${url}"` :
    process.platform === "darwin" ? `open "${url}"` :
                                    `xdg-open "${url}"`;
  exec(cmd, (err) => { if (err) console.warn("Could not auto-open browser:", err.message); });
}

// ── Quiz Question Generator via Groq ─────────────────────────────────────────
async function generateQuizQuestions(subject, count = 7) {
  const groq = getGroq();
  if (!groq) return null;

  const topicGuide = {
    "Academic": "computer science, programming, data structures, algorithms, operating systems, databases, networks",
    "Books": "famous books, authors, literature, library science, book genres, ISBNs, notable publications",
    "General Knowledge": "technology, science, world facts, history of computing, inventors, current tech trends",
    "Mixed": "a mix of computer science, books/literature, and general knowledge topics"
  };
  const topics = topicGuide[subject] || topicGuide["Mixed"];

  const prompt = `You are a quiz generator for an educational app called BookFlow for engineering students.
Generate exactly ${count} multiple-choice questions about: ${topics}.

Rules:
- Each question must have exactly 4 options (A, B, C, D)
- Questions must be factual and educational
- Difficulty: mix of easy, medium, hard
- Explanations must be 1-2 sentences, clear and educational

Respond ONLY with valid JSON in this exact format (no extra text before or after):
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief explanation why option A is correct."
    }
  ]
}

The "correct" field is a 0-based index (0=A, 1=B, 2=C, 3=D).`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.6,
      max_tokens: 2500,
    });
    const raw  = completion.choices[0]?.message?.content?.trim();
    if (!raw) return null;

    // Extract JSON block safely
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(parsed.questions) || parsed.questions.length < 3) return null;

    // Validate each question structure
    const valid = parsed.questions.filter(q =>
      q.question && Array.isArray(q.options) && q.options.length === 4 &&
      typeof q.correct === "number" && q.correct >= 0 && q.correct <= 3
    );
    return valid.length >= 3 ? valid.slice(0, count) : null;

  } catch (e) {
    console.error("[/api/quiz] Groq error:", e?.message || e);
    return null;
  }
}

// ── AI Tips Generator via Groq ────────────────────────────────────────────────
async function generateAITips(stats) {
  const groq = getGroq();
  if (!groq) return null;

  const prompt = `You are a personalized learning coach for BookFlow, an educational app for engineering students.

Student stats:
- Quiz average: ${stats.quizAvg}%
- Overall accuracy: ${stats.accuracy}%
- Study hours this week: ${stats.studyHours}h
- Current streak: ${stats.streak} days
- Weakest subject: ${stats.weakSubject} (${stats.weakScore}%)
- Strongest subject: ${stats.strongSubject} (${stats.strongScore}%)
- Total quizzes: ${stats.quizTotal}

Generate exactly 3 personalized, actionable improvement tips for this student. Be specific, motivating, and practical.

Respond ONLY with JSON:
{
  "tips": [
    { "icon": "emoji", "tip": "Specific actionable advice." },
    { "icon": "emoji", "tip": "Another specific tip." },
    { "icon": "emoji", "tip": "Another specific tip." }
  ]
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 400,
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return null;
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    return Array.isArray(parsed.tips) && parsed.tips.length >= 1 ? parsed.tips : null;
  } catch (e) {
    console.error("[/api/tips] Groq error:", e?.message || e);
    return null;
  }
}

async function main() {
  const db = await initDb();
  await ensureDefaultMemberProfile(db);
  await seedIfEmpty(db);

  const app = express();
  app.use(express.json({ limit: "256kb" }));

  // Serve root-level HTML files (homepage.html, index.html, library.html)
  // css/, js/, books.csv, logo.jpg, etc.
  app.use(express.static(ROOT));

  // Also serve the original /public folder (legacy)
  app.use(express.static(path.join(ROOT, "public")));

  app.get("/api/health", (req, res) => {
    res.json({ ok: true });
  });

  // ── TTS Proxy ─────────────────────────────────────────────────────────────
  // POST /api/tts — { text: string, voice: "nova"|"onyx"|"alloy"|"shimmer"|"echo" }
  // If OpenAI key is set: streams MP3 audio back
  // If not: returns { fallback: true } and frontend uses browser TTS
  app.post("/api/tts", async (req, res) => {
    const { text, voice = "alloy" } = req.body || {};
    if (!text || !text.trim()) return res.status(400).json({ error: "No text provided" });

    if (!openaiClient) {
      return res.json({ fallback: true });
    }

    try {
      const response = await openaiClient.audio.speech.create({
        model: "tts-1",
        voice: voice,
        input: text.slice(0, 4096), // OpenAI limit
        response_format: "mp3",
      });
      const buffer = Buffer.from(await response.arrayBuffer());
      res.set("Content-Type", "audio/mpeg");
      res.set("Content-Length", buffer.length);
      res.send(buffer);
    } catch (e) {
      console.error("[/api/tts] Error:", e?.message || e);
      res.json({ fallback: true });
    }
  });

  // ── Quiz Generator ────────────────────────────────────────────────────────
  // POST /api/quiz — { subject: "Academic"|"Books"|"General Knowledge"|"Mixed", count: 7 }
  app.post("/api/quiz", async (req, res) => {
    const { subject = "Mixed", count = 7 } = req.body || {};
    try {
      const questions = await generateQuizQuestions(subject, Math.min(count, 10));
      if (questions && questions.length >= 3) {
        return res.json({ ok: true, questions, source: "ai" });
      }
      return res.json({ ok: false, questions: [], source: "fallback" });
    } catch (e) {
      console.error("[/api/quiz] Unhandled error:", e?.message || e);
      return res.json({ ok: false, questions: [], source: "fallback" });
    }
  });

  // ── AI Improvement Tips ───────────────────────────────────────────────────
  // POST /api/tips — { quizAvg, accuracy, studyHours, streak, weakSubject, weakScore, strongSubject, strongScore, quizTotal }
  app.post("/api/tips", async (req, res) => {
    const stats = req.body || {};
    try {
      const tips = await generateAITips(stats);
      if (tips && tips.length > 0) {
        return res.json({ ok: true, tips, source: "ai" });
      }
      // Rule-based fallback tips
      const fallback = _ruleTips(stats);
      return res.json({ ok: true, tips: fallback, source: "fallback" });
    } catch (e) {
      console.error("[/api/tips] Unhandled error:", e?.message || e);
      return res.json({ ok: true, tips: _ruleTips(stats), source: "fallback" });
    }
  });

  // ── Chat ──────────────────────────────────────────────────────────────────
  app.post("/api/chat", async (req, res) => {
    const { message, memberId } = req.body || {};
    try {
      const result = await handleChat(db, {
        message,
        memberId: Number.isFinite(memberId) ? memberId : memberId ?? DEFAULT_MEMBER_ID
      });
      res.json({ ok: true, ...result });
    } catch (e) {
      console.error("[/api/chat] Unhandled error:", e?.message || e);
      res.json({
        ok: false,
        reply: "Sorry, something went wrong. Please try again in a moment."
      });
    }
  });

  app.listen(PORT, () => {
    const base = `http://localhost:${PORT}`;
    console.log(`\n🚀 BookFLow running on ${base}`);
    console.log(`   🏠 Homepage : ${base}/homepage.html`);
    console.log(`   📚 Library  : ${base}/library.html`);
    console.log(`   🤖 App      : ${base}/index.html\n`);

    // Auto-open all three pages in the default browser (staggered slightly)
    setTimeout(() => openBrowser(`${base}/homepage.html`), 300);
    setTimeout(() => openBrowser(`${base}/library.html`),  700);
    setTimeout(() => openBrowser(`${base}/index.html`),   1100);
  });
}

function _ruleTips(stats) {
  const tips = [];
  if (stats.weakScore < 60) {
    tips.push({ icon: "⚠️", tip: `Your ${stats.weakSubject || "weakest subject"} accuracy is ${stats.weakScore || 0}%. Try completing 2-3 focused quizzes on this subject daily to improve.` });
  }
  if (stats.studyHours < 5) {
    tips.push({ icon: "⏱️", tip: `You studied only ${stats.studyHours || 0} hours this week. Aim for at least 2 hours daily — even short focused sessions add up!` });
  }
  if (stats.streak < 3) {
    tips.push({ icon: "🔥", tip: `Your current streak is ${stats.streak || 0} days. Try logging in every day for 3 days to unlock the 3-Day Streak badge!` });
  }
  if (stats.quizAvg >= 80) {
    tips.push({ icon: "🚀", tip: `Your quiz average is an impressive ${stats.quizAvg}%! Consider trying harder categories and Mixed quizzes to keep challenging yourself.` });
  }
  if (tips.length < 3) {
    tips.push({ icon: "💡", tip: `Consistency is key. Use the Pomodoro technique — 25 minutes of focused study followed by a 5-minute break — to maximize retention.` });
  }
  if (tips.length < 3) {
    tips.push({ icon: "📚", tip: `Check out the Library for books on ${stats.weakSubject || "your weakest subject"} to build a deeper conceptual foundation.` });
  }
  return tips.slice(0, 3);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


