// ─── Auth Module ──────────────────────────────────────────────────────────────
// Each user gets their own data stored under "libramate_user_<username>"
// The currently logged-in user is tracked in sessionStorage for tab safety
// and in localStorage for persistent "remember me" sessions.

const Auth = (() => {

    const USERS_INDEX_KEY = "libramate_users_index"; // list of registered usernames
    const SESSION_KEY = "libramate_session";      // who is currently logged in
    const REMEMBER_KEY = "libramate_remember";     // persisted login (remember me)

    // ── Helpers ────────────────────────────────────────────────────────────────

    function getUsersIndex() {
        try { return JSON.parse(localStorage.getItem(USERS_INDEX_KEY)) || []; }
        catch { return []; }
    }

    function saveUsersIndex(list) {
        localStorage.setItem(USERS_INDEX_KEY, JSON.stringify(list));
    }

    function userDataKey(username) {
        return "libramate_user_" + username.toLowerCase().trim();
    }

    function hashPassword(pw) {
        // Simple but deterministic string hash — not cryptographic, but enough
        // for a local-storage app with no server.
        let h = 0;
        for (let i = 0; i < pw.length; i++) {
            h = (Math.imul(31, h) + pw.charCodeAt(i)) | 0;
        }
        return h.toString(16);
    }

    // ── Public API ─────────────────────────────────────────────────────────────

    /** Returns the username of the currently logged-in user, or null. */
    function currentUser() {
        return sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(REMEMBER_KEY) || null;
    }

    /** Register a new user. Returns { ok, error }. */
    function register({ username, displayName, password, avatar }) {
        username = username.toLowerCase().trim();
        if (!username || username.length < 3)
            return { ok: false, error: "Username must be at least 3 characters." };
        if (!password || password.length < 4)
            return { ok: false, error: "Password must be at least 4 characters." };
        const index = getUsersIndex();
        if (index.includes(username))
            return { ok: false, error: "Username already taken. Please choose another." };

        // Create default student profile for this user
        const student = {
            ...JSON.parse(JSON.stringify(DEFAULT_STUDENT)),
            name: displayName || capitalize(username),
            avatar: avatar || "👨‍🎓",
        };

        const userRecord = {
            username,
            displayName: displayName || capitalize(username),
            passwordHash: hashPassword(password),
            avatar: avatar || "👨‍🎓",
            createdAt: new Date().toISOString(),
        };

        localStorage.setItem(userDataKey(username), JSON.stringify({
            meta: userRecord,
            student,
            chatHistory: [],
        }));

        index.push(username);
        saveUsersIndex(index);
        return { ok: true };
    }

    /** Log in. Returns { ok, error }. */
    function login({ username, password, remember }) {
        username = username.toLowerCase().trim();
        const raw = localStorage.getItem(userDataKey(username));
        if (!raw) return { ok: false, error: "No account found with that username." };
        try {
            const data = JSON.parse(raw);
            if (data.meta.passwordHash !== hashPassword(password))
                return { ok: false, error: "Incorrect password. Please try again." };
            sessionStorage.setItem(SESSION_KEY, username);
            if (remember) localStorage.setItem(REMEMBER_KEY, username);
            else localStorage.removeItem(REMEMBER_KEY);
            return { ok: true, username };
        } catch {
            return { ok: false, error: "Login error. Please try again." };
        }
    }

    /** Log out the current user. */
    function logout() {
        sessionStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(REMEMBER_KEY);
    }

    /** Load a user's full saved data (student + chatHistory). */
    function loadUserData(username) {
        try {
            const raw = localStorage.getItem(userDataKey(username));
            if (!raw) return null;
            return JSON.parse(raw);
        } catch { return null; }
    }

    /** Save a user's student + chatHistory data back to localStorage. */
    function saveUserData(username, student, chatHistory) {
        const raw = localStorage.getItem(userDataKey(username));
        let existing = {};
        try { existing = JSON.parse(raw) || {}; } catch { }
        existing.student = student;
        existing.chatHistory = chatHistory;
        localStorage.setItem(userDataKey(username), JSON.stringify(existing));
    }

    /** Returns a list of all registered usernames. */
    function listUsers() { return getUsersIndex(); }

    function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    return { currentUser, register, login, logout, loadUserData, saveUserData, listUsers };
})();
