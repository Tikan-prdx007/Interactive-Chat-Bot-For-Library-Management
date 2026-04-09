require("dotenv").config(); // must be first — loads OPENAI_API_KEY into process.env

const path = require("path");
const express = require("express");
const { exec } = require("child_process");

const { initDb, seedIfEmpty, ensureDefaultMemberProfile, DEFAULT_MEMBER_ID } = require("./db");
const { handleChat } = require("./chatbot");

const PORT = Number.parseInt(process.env.PORT || "5050", 10);
const ROOT = path.join(__dirname, ".."); // project root (where homepage.html etc. live)

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
      // Always return a reply so the frontend shows something useful
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

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

