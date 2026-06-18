"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

type ThemeContextValue = {
  theme: Theme;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggle: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // The pre-hydration script in layout already applied the saved theme to
    // <html>; read it back so the toggle matches without a second flash.
    const isLight = document.documentElement.classList.contains("theme-light");
    setTheme(isLight ? "light" : "dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("theme-light", theme === "light");
    window.localStorage.setItem("mars-theme", theme);
  }, [theme]);

  const toggle = () =>
    setTheme((current) => (current === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
      {/* Global, page-agnostic toggle — bottom-right so it never collides with
          the landing nav and stays reachable on the app and report pages. */}
      <ThemeToggle className="fixed bottom-5 right-5 z-[60]" />
    </ThemeContext.Provider>
  );
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const goingLight = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={goingLight ? "Switch to light mode" : "Switch to dark mode"}
      title={goingLight ? "Light mode" : "Dark mode"}
      className={[
        "flex h-10 w-10 items-center justify-center rounded-full border border-[var(--surface-border)]",
        "bg-[var(--surface-panel)] text-[var(--text-secondary)] shadow-[0_10px_36px_rgba(0,0,0,0.18)] backdrop-blur-xl",
        "transition-all hover:scale-105 hover:bg-[var(--surface-panel-strong)] hover:text-[var(--text-primary)]",
        className,
      ].join(" ")}
    >
      {goingLight ? (
        <Sun className="size-[17px]" strokeWidth={1.75} />
      ) : (
        <Moon className="size-[17px]" strokeWidth={1.75} />
      )}
    </button>
  );
}
