import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface ThemeState {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            theme: "dark",

            toggleTheme: () => {
                const nextTheme = get().theme === "light" ? "dark" : "light";
                set({ theme: nextTheme });

                document.body.className = nextTheme;

            },

            setTheme: (theme) => {
                set({ theme });

                document.body.className = theme;

            },
        }),
        {
            name: "theme-storage",
            onRehydrateStorage: () => (state) => {
                document.body.className = state?.theme || "dark";

            },
        }
    )
);
