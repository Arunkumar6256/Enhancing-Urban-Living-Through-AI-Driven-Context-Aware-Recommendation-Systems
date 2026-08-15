import React from "react";
import { useTheme } from "../utils/ThemeContext";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/10 text-xl"
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
        >
            {theme === "light" ? "🌙" : "☀️"}
        </button>
    );
}
