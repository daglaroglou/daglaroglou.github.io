import { Volume2, VolumeX } from "lucide-react";
import { useSound } from "@/hooks/use-sound";
import { useEffect, useState } from "react";

const SoundToggle = () => {
  const { isMuted, toggleMute, playToggle } = useSound();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    toggleMute();
    if (isMuted) {
      // If it was muted, it will now be unmuted, so we can play the toggle sound
      playToggle();
    }
  };

  if (!mounted) return null;

  return (
    <button
      onClick={handleToggle}
      className="glass-card p-3 rounded-full hover-lift transition-all hover:scale-110 group"
      aria-label="Toggle sound"
      title={isMuted ? "Unmute sounds" : "Mute sounds"}
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5 text-muted-foreground transition-transform group-hover:scale-110 duration-300" />
      ) : (
        <Volume2 className="w-5 h-5 text-primary transition-transform group-hover:scale-110 duration-300" />
      )}
    </button>
  );
};

export default SoundToggle;
