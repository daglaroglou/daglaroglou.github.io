import { useEffect, useState, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Container } from "@tsparticles/engine";
import { useTheme } from "next-themes";

const ParticlesBackground = () => {
  const { theme } = useTheme();
  const [particlesInit, setParticlesInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setParticlesInit(true);
    });
  }, []);

  const particlesLoaded = async (_container?: Container): Promise<void> => {};

  const particlesOptions = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "bubble",
          },
          onHover: {
            enable: true,
            mode: "bubble",
          },
        },
        modes: {
          bubble: {
            distance: 200,
            size: 8,
            duration: 2,
            opacity: 0.8,
          },
        },
      },
      particles: {
        color: {
          value: theme === "dark" ? "#ffffff" : "#000000",
        },
        links: {
          enable: false,
        },
        move: {
          direction: "top" as const,
          enable: true,
          outModes: {
            default: "out" as const,
          },
          random: false,
          speed: { min: 0.3, max: 1 },
          straight: false,
          warp: true,
        },
        number: {
          density: {
            enable: true,
          },
          value: 40,
        },
        opacity: {
          value: { min: 0.2, max: 0.6 },
          animation: {
            enable: true,
            speed: 0.8,
            minimumValue: 0.1,
            sync: false,
          },
        },
        rotate: {
          value: { min: 0, max: 360 },
          animation: {
            enable: true,
            speed: 5,
            sync: false,
          },
        },
        shape: {
          type: ["circle", "square", "triangle", "polygon"],
          options: {
            polygon: {
              sides: 6,
            },
          },
        },
        size: {
          value: { min: 2, max: 6 },
          animation: {
            enable: false,
          },
        },
        wobble: {
          enable: true,
          distance: 10,
          speed: 3,
        },
        roll: {
          enable: true,
          speed: 2,
        },
      },
      detectRetina: true,
    }),
    [theme],
  );

  if (!particlesInit) return null;

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden
    >
      <Particles
        id="tsparticles-pages"
        particlesLoaded={particlesLoaded}
        options={particlesOptions}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};

export default ParticlesBackground;
