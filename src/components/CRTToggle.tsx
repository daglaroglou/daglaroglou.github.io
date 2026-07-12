import { Monitor, MonitorOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useSound } from "@/hooks/use-sound";

const CRTToggle = () => {
  const [isCRTEnabled, setIsCRTEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("crtEnabled");
      return stored === null ? true : stored === "true";
    }
    return true;
  });
  const [mounted, setMounted] = useState(false);
  const { playToggle } = useSound();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("crtEnabled", isCRTEnabled.toString());
    if (isCRTEnabled) {
      document.documentElement.classList.add("crt-enabled");
    } else {
      document.documentElement.classList.remove("crt-enabled");
    }
  }, [isCRTEnabled]);

  const toggleCRT = () => {
    setIsCRTEnabled((prev) => !prev);
    playToggle();
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleCRT}
      className="glass-card p-3 rounded-full hover-lift transition-all hover:scale-110 group"
      aria-label="Toggle CRT Effect"
      title={isCRTEnabled ? "Disable CRT Effect" : "Enable CRT Effect"}
    >
      {isCRTEnabled ? (
        <Monitor className="w-5 h-5 transition-transform group-hover:scale-110 duration-300" />
      ) : (
        <MonitorOff className="w-5 h-5 text-muted-foreground transition-transform group-hover:scale-110 duration-300" />
      )}
    </button>
  );
};

export default CRTToggle;
