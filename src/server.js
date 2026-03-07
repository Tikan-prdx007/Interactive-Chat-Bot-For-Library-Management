const path = require("path");
const express = require("express");

const { initDb, seedIfEmpty, ensureDefaultMemberProfile, DEFAULT_MEMBER_ID } = require("./db");
const { handleChat } = require("./chatbot");

const PORT = Number.parseInt(process.env.PORT || "5050", 10);

async function main() {
  const db = await initDb();
  await ensureDefaultMemberProfile(db);
  await seedIfEmpty(db);

  const app = express();
  app.use(express.json({ limit: "256kb" }));
  app.use(express.static(path.join(__dirname, "..", "public")));

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
    console.log(`LibraMate running on http://localhost:${PORT}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

