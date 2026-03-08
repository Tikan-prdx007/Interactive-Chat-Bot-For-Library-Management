const path = require("path");
const express = require("express");
const { exec } = require("child_process");

const { initDb, seedIfEmpty, ensureDefaultMemberProfile, DEFAULT_MEMBER_ID } = require("./db");
const { handleChat } = require("./chatbot");

const PORT = Number.parseInt(process.env.PORT || "5050", 10);
const ROOT = path.join(__dirname, ".."); // project root (where homepage.html etc. live)

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

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, memberId } = req.body || {};
      const result = await handleChat(db, {
        message,
        memberId: Number.isFinite(memberId) ? memberId : memberId ?? DEFAULT_MEMBER_ID
      });
      res.json({ ok: true, ...result });
    } catch (e) {
      res.status(500).json({ ok: false, error: "SERVER_ERROR" });
    }
  });

  app.listen(PORT, () => {
    const base = `http://localhost:${PORT}`;
    console.log(`\n🚀 SHELFBOT running on ${base}`);
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

