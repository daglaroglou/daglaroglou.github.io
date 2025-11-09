import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="glass-card p-3 rounded-full w-12 h-12" />
    );
  }

  const toggleTheme = () => {
    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      setTheme(theme === "dark" ? "light" : "dark");
      return;
    }

    // Use View Transitions API for smooth theme change
    document.startViewTransition(() => {
      setTheme(theme === "dark" ? "light" : "dark");
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className="glass-card p-3 rounded-full hover-lift transition-all hover:scale-110 group"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" />
      ) : (
        <Moon className="w-5 h-5 transition-transform group-hover:-rotate-12 duration-300" />
      )}
    </button>
  );
};

export default ThemeToggle;

