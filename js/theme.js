// ─── Theme Module ─────────────────────────────────────────────────────────────
// Manages light/dark mode. Reads from localStorage, applies immediately on
// load to prevent flash, and exposes a toggle for the UI button.

const Theme = (() => {
    const KEY = "libramate_theme";

    function get() {
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

    // Apply immediately on script load (before DOMContentLoaded) to avoid flash
    apply(get());

    return { get, apply, toggle };
})();
