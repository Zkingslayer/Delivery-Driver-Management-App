import { writable } from "svelte/store";
import { browser } from "$app/environment";

/**
 * Theme store that persists to localStorage.
 * Values: "light" | "dark"
 */
function createThemeStore() {
    // Read from localStorage or default to "light"
    const initial = browser
        ? localStorage.getItem("theme") || "light"
        : "light";

    const { subscribe, set, update } = writable(initial);

    // Apply the theme class on the <html> element
    function applyTheme(/** @type {string} */ theme) {
        if (!browser) return;
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }

    // Apply initial theme immediately without transition
    if (browser) {
        applyTheme(initial);
    }

    return {
        subscribe,
        /** Toggle between light and dark with smooth transition */
        toggle() {
            update((current) => {
                const next = current === "dark" ? "light" : "dark";

                // Add transition class only during toggle
                if (browser) {
                    const root = document.documentElement;
                    root.classList.add("theme-transition");
                    applyTheme(next);

                    // Remove transition class after animation completes
                    setTimeout(() => {
                        root.classList.remove("theme-transition");
                    }, 750);
                } else {
                    applyTheme(next);
                }

                return next;
            });
        },
        /** Set a specific theme */
        setTheme(/** @type {string} */ theme) {
            set(theme);
            applyTheme(theme);
        },
    };
}

export const theme = createThemeStore();
