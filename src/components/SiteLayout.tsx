import { Outlet } from "react-router-dom";
import SiteFooter from "@/components/SiteFooter";
import ControlsGroup from "@/components/ControlsGroup";
import { useEffect } from "react";
import { useSound } from "@/hooks/use-sound";

const SiteLayout = () => {
  const { playClick } = useSound();

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest('[role="button"]')
      ) {
        playClick();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [playClick]);

  return (
    <div className="flex min-h-screen flex-col screen-flicker">
      <ControlsGroup />
      <div className="scanlines"></div>
      <div className="flex-1 flex flex-col min-h-0">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
};

export default SiteLayout;
