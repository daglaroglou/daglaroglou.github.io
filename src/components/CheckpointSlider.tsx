import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

interface Checkpoint {
  id: string;
  label: string;
  icon?: string;
}

const checkpoints: Checkpoint[] = [
  { id: "hero", label: "Home", icon: "🏠" },
  { id: "github", label: "Projects", icon: "📂" },
  { id: "pcstats", label: "Rig stats", icon: "🖥️" },
  { id: "grades", label: "Grades", icon: "🎓" },
  { id: "blog", label: "Blog", icon: "📝" },
  { id: "donation", label: "Support", icon: "❤️" },
];

const CheckpointSlider = () => {
  const [activeCheckpoint, setActiveCheckpoint] = useState<string>("hero");
  const [isVisible, setIsVisible] = useState(true);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      // Hide slider when scrolled less than 100px
      if (window.scrollY < 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      // Determine active checkpoint based on scroll position
      const sections = checkpoints.map((cp) => ({
        id: cp.id,
        element: document.getElementById(cp.id),
      }));

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 200) {
            setActiveCheckpoint(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToCheckpoint = (checkpointId: string) => {
    const element = document.getElementById(checkpointId);
    if (element) {
      const offset = 80; // Offset for header spacing
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }
  };

  return (
    <nav
      aria-label="Page sections"
      className={cn(
        "fixed left-6 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 hidden md:block",
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full pointer-events-none"
      )}
    >
      <div className="relative flex flex-col gap-4 bg-background/80 backdrop-blur-lg border border-border rounded-full px-3 py-6 shadow-lg">
        {/* Sliding indicator */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-10 h-10 bg-primary rounded-full transition-all duration-300 ease-out"
          style={{
            top: `${checkpoints.findIndex((cp) => cp.id === activeCheckpoint) * 56 + 24}px`,
          }}
        />

        {/* Checkpoint buttons */}
        {checkpoints.map((checkpoint) => (
          <button
            key={checkpoint.id}
            type="button"
            onClick={() => scrollToCheckpoint(checkpoint.id)}
            className={cn(
              "relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              activeCheckpoint === checkpoint.id
                ? "text-primary-foreground scale-110"
                : "text-muted-foreground hover:text-foreground hover:scale-110"
            )}
            aria-label={`Go to ${checkpoint.label}`}
            aria-current={activeCheckpoint === checkpoint.id ? "location" : undefined}
            title={checkpoint.label}
          >
            <span className="text-xl" aria-hidden>
              {checkpoint.icon}
            </span>
            
            {/* Tooltip */}
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-popover text-popover-foreground text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg border border-border">
              {checkpoint.label}
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default CheckpointSlider;

