import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const ThemeToggle = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const currentTheme = resolvedTheme ?? theme;

  const toggleTheme = () => {
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    // Use View Transitions API for smooth theme change
    document.startViewTransition(() => {
      setTheme(nextTheme);
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className="glass-card p-3 rounded-full hover-lift transition-all hover:scale-110 group"
      aria-label="Toggle theme"
    >
      {currentTheme === "dark" ? (
        <Sun className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" />
      ) : (
        <Moon className="w-5 h-5 transition-transform group-hover:-rotate-12 duration-300" />
      )}
    </button>
  );
};

export default ThemeToggle;

