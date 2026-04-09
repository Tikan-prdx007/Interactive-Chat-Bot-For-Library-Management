// ─── Theme Module ─────────────────────────────────────────────────────────────
// Always starts in dark mode on every page visit.
// Exposes a toggle for the UI button (persists choice until next page load).

const Theme = (() => {
    const KEY = "libramate_theme";

    function get() {
        // Always default to dark — user can toggle in-session but next visit resets to dark
        return localStorage.getItem(KEY) || "dark";
    }

    function apply(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem(KEY, theme);
        // Update toggle button icon if it exists
        const btn = document.getElementById("theme-toggle");
        if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
    }

    function toggle() {
        apply(get() === "dark" ? "light" : "dark");
    }

    // ALWAYS force dark on every page load — overrides any stale saved value
    apply("dark");

    return { get, apply, toggle };
})();
