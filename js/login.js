// ─── Login Screen Module ──────────────────────────────────────────────────────
// Renders a full-screen login/register overlay before the main app renders.

const LoginScreen = (() => {

  const AVATARS = ["👨‍🎓", "👩‍🎓", "🧑‍💻", "👩‍💻", "🧑‍🔬", "👩‍🔬", "🧑‍🏫", "👩‍🏫", "🧙", "🦸"];

  function show() {
    // Hide the main app shell until logged in
    const shell = document.getElementById("app-shell");
    if (shell) shell.style.display = "none";

    const overlay = document.createElement("div");
    overlay.id = "login-overlay";
    overlay.innerHTML = `
      <div class="login-bg">
        <div class="login-orbs">
          <div class="orb orb1"></div>
          <div class="orb orb2"></div>
          <div class="orb orb3"></div>
        </div>
        <div class="login-card">
          <div class="login-brand">
            <div class="login-logo" style="width:72px;height:72px;overflow:hidden;border-radius:14px;"><img src="logo.jpg" alt="SHELFBOT Logo" style="width:100%;height:100%;object-fit:cover;"></div>
            <div class="login-brand-text">
              <div class="login-brand-name">SHELFBOT</div>
              <div class="login-brand-sub">AI-Powered Library & Study Companion</div>
            </div>
          </div>

          <!-- Tab Toggle -->
          <div class="login-tabs">
            <button class="ltab active" id="tab-login"    onclick="LoginScreen.switchTab('login')">Sign In</button>
            <button class="ltab"        id="tab-register" onclick="LoginScreen.switchTab('register')">Create Account</button>
          </div>

          <!-- Error banner -->
          <div class="login-error" id="login-error" style="display:none"></div>

          <!-- ── LOGIN FORM ── -->
          <form id="form-login" class="login-form" onsubmit="LoginScreen.doLogin(event)">
            <div class="lform-group">
              <label>Username</label>
              <input id="login-username" type="text" placeholder="Enter your username"
                     autocomplete="username" required />
            </div>
            <div class="lform-group">
              <label>Password</label>
              <div class="pw-wrap">
                <input id="login-password" type="password" placeholder="Enter your password"
                       autocomplete="current-password" required />
                <button type="button" class="pw-toggle" onclick="LoginScreen.togglePw('login-password', this)">👁</button>
              </div>
            </div>
            <div class="lform-remember">
              <label><input type="checkbox" id="login-remember" /> Remember me</label>
            </div>
            <button type="submit" class="btn-login" id="login-submit">Sign In →</button>
          </form>

          <!-- ── REGISTER FORM ── -->
          <form id="form-register" class="login-form" style="display:none" onsubmit="LoginScreen.doRegister(event)">
            <div class="avatar-picker-label">Choose your avatar</div>
            <div class="avatar-picker" id="avatar-picker">
              ${AVATARS.map((a, i) => `<div class="av-opt ${i === 0 ? 'selected' : ''}" data-av="${a}" onclick="LoginScreen.pickAvatar(this)">${a}</div>`).join("")}
            </div>
            <div class="lform-row">
              <div class="lform-group">
                <label>Display Name</label>
                <input id="reg-displayname" type="text" placeholder="e.g. Aarav" required />
              </div>
              <div class="lform-group">
                <label>Username</label>
                <input id="reg-username" type="text" placeholder="min 3 chars" required />
              </div>
            </div>
            <div class="lform-group">
              <label>Password</label>
              <div class="pw-wrap">
                <input id="reg-password" type="password" placeholder="min 4 characters" required />
                <button type="button" class="pw-toggle" onclick="LoginScreen.togglePw('reg-password', this)">👁</button>
              </div>
            </div>
            <div class="lform-group">
              <label>Confirm Password</label>
              <div class="pw-wrap">
                <input id="reg-confirm" type="password" placeholder="Repeat password" required />
                <button type="button" class="pw-toggle" onclick="LoginScreen.togglePw('reg-confirm', this)">👁</button>
              </div>
            </div>
            <button type="submit" class="btn-login" id="reg-submit">Create Account →</button>
          </form>

          <!-- Registered users quick-switch -->
          <div id="quick-switch" class="quick-switch"></div>

          <p class="login-footer">Your progress is saved privately for your account only 🔒</p>
        </div>
      </div>`;
    document.body.insertBefore(overlay, document.body.firstChild);
    renderQuickSwitch();
  }

  function hide() {
    const overlay = document.getElementById("login-overlay");
    if (overlay) {
      overlay.classList.add("login-fade-out");
      setTimeout(() => overlay.remove(), 400);
    }
    const shell = document.getElementById("app-shell");
    if (shell) shell.style.display = "flex";
  }

  function switchTab(tab) {
    document.getElementById("form-login").style.display = tab === "login" ? "flex" : "none";
    document.getElementById("form-register").style.display = tab === "register" ? "flex" : "none";
    document.getElementById("tab-login").classList.toggle("active", tab === "login");
    document.getElementById("tab-register").classList.toggle("active", tab === "register");
    setError("");
  }

  function setError(msg) {
    const el = document.getElementById("login-error");
    if (!el) return;
    if (msg) { el.textContent = msg; el.style.display = "block"; }
    else { el.style.display = "none"; }
  }

  function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? "Please wait…" : btn.getAttribute("data-label") || btn.textContent;
  }

  function doLogin(e) {
    e.preventDefault();
    setError("");
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;
    const remember = document.getElementById("login-remember").checked;
    const result = Auth.login({ username, password, remember });
    if (!result.ok) { setError(result.error); return; }
    hide();
    App.afterLogin();
  }

  function doRegister(e) {
    e.preventDefault();
    setError("");
    const displayName = document.getElementById("reg-displayname").value.trim();
    const username = document.getElementById("reg-username").value.trim();
    const password = document.getElementById("reg-password").value;
    const confirm = document.getElementById("reg-confirm").value;
    const avatar = document.querySelector(".av-opt.selected")?.dataset.av || "👨‍🎓";
    if (password !== confirm) { setError("Passwords do not match."); return; }
    const result = Auth.register({ username, displayName, password, avatar });
    if (!result.ok) { setError(result.error); return; }
    // Auto-login after registration
    Auth.login({ username, password, remember: false });
    hide();
    App.afterLogin();
  }

  function pickAvatar(el) {
    document.querySelectorAll(".av-opt").forEach(a => a.classList.remove("selected"));
    el.classList.add("selected");
  }

  function togglePw(inputId, btn) {
    const inp = document.getElementById(inputId);
    if (inp.type === "password") { inp.type = "text"; btn.textContent = "🙈"; }
    else { inp.type = "password"; btn.textContent = "👁"; }
  }

  function renderQuickSwitch() {
    const users = Auth.listUsers();
    const wrap = document.getElementById("quick-switch");
    if (!wrap || !users.length) return;
    wrap.innerHTML = `<div class="qs-label">Quick sign-in as:</div>
      <div class="qs-chips">
        ${users.map(u => {
      const data = Auth.loadUserData(u);
      const avatar = data?.meta?.avatar || "👤";
      const name = data?.meta?.displayName || u;
      return `<div class="qs-chip" onclick="LoginScreen.quickLogin('${u}')">
            <span class="qs-av">${avatar}</span>
            <span class="qs-name">${name}</span>
          </div>`;
    }).join("")}
      </div>`;
  }

  function quickLogin(username) {
    // Fill the username field and focus password
    switchTab("login");
    document.getElementById("login-username").value = username;
    document.getElementById("login-password").focus();
  }

  return { show, hide, switchTab, doLogin, doRegister, pickAvatar, togglePw, quickLogin };
})();
