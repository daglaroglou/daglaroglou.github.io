import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/** Dollar-sign intro art: a human stretching their back — monospace aligned */
const ASCII_FRAMES = [
  [
    "             $$$$$",
    "            $     $",
    "           $       $",
    "            $     $",
    "             $$$$$",
    "         $$",
    "        $$$",
    "       $  $",
    "      $    $",
    "     $  $$$",
    "    $$$$",
    "    $",
    "    $",
    "     $",
    "      $",
    "       $",
    "      $$$",
  ],
  [
    "               $$$$$",
    "              $     $",
    "             $       $",
    "              $     $",
    "               $$$$$",
    "         $$",
    "        $$$",
    "       $  $$",
    "      $    $",
    "     $   $$$",
    "    $$$$",
    "    $",
    "    $",
    "     $",
    "      $",
    "       $",
    "      $$$",
  ],
  [
    "              $$$$$",
    "             $     $",
    "            $       $",
    "             $     $",
    "              $$$$$",
    "         $$",
    "        $$$",
    "       $  $",
    "      $   $$",
    "     $  $$$",
    "    $$$$",
    "    $",
    "    $",
    "     $",
    "      $",
    "       $",
    "      $$$",
  ],
];

const FIGURE_FRAME_WIDTH_CH = 22;

/** Pre (ASCII) enter / exit motion — matches Tailwind `duration-500` */
const ENTER_MS = 500;
const DISPLAY_MS = 2600;
const EXIT_MS = 550;
const DISPLAY_MS_REDUCED = 900;
const EXIT_MS_REDUCED = 120;
const FRAME_MS = 240;
const FRAME_SEQUENCE = [0, 0, 1, 2, 2, 1, 0];

function normalizePathname(path: string): string {
  const t = path.replace(/\/+$/, "");
  return t === "" ? "/" : t;
}

/** Splash on full loads at site home (respects Vite `base`, e.g. GitHub Project Pages). */
function isHomeDocumentLoad(): boolean {
  if (typeof window === "undefined") return false;
  const rawBase = import.meta.env.BASE_URL ?? "/";
  const baseNorm = normalizePathname(rawBase);
  const pathNorm = normalizePathname(window.location.pathname);

  if (baseNorm === "/" || baseNorm === "") {
    return pathNorm === "/";
  }
  return pathNorm === baseNorm;
}

const FirstVisitSplash = () => {
  const reducedMotion = usePrefersReducedMotion();
  const [active, setActive] = useState(() => isHomeDocumentLoad());
  const [entered, setEntered] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [frameStep, setFrameStep] = useState(0);

  useLayoutEffect(() => {
    if (!active) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    if (reducedMotion) {
      queueMicrotask(() => setEntered(true));
      return;
    }

    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [active, reducedMotion]);

  useEffect(() => {
    if (!active || !entered) return;

    const enterMs = reducedMotion ? 200 : ENTER_MS;
    const displayMs = reducedMotion ? DISPLAY_MS_REDUCED : DISPLAY_MS;
    const fadeMs = reducedMotion ? EXIT_MS_REDUCED : EXIT_MS;

    const afterHold = enterMs + displayMs;

    const fadeTimer = window.setTimeout(() => setExiting(true), afterHold);
    const doneTimer = window.setTimeout(() => {
      document.body.style.overflow = "";
      setActive(false);
    }, afterHold + fadeMs);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [active, entered, reducedMotion]);

  useEffect(() => {
    if (!active || !entered || exiting || reducedMotion) return;

    const id = window.setInterval(() => {
      setFrameStep((prev) => (prev + 1) % FRAME_SEQUENCE.length);
    }, FRAME_MS);

    return () => window.clearInterval(id);
  }, [active, entered, exiting, reducedMotion]);

  if (!active) return null;

  const outerCls = [
    "fixed inset-0 z-[2147483647]",
    exiting
      ? reducedMotion
        ? "opacity-0 transition-opacity duration-100 ease-out"
        : "opacity-0 transition-opacity duration-500 ease-out"
      : "opacity-100",
  ].join(" ");

  const preMotionCls = reducedMotion
    ? "transition-opacity duration-200 ease-out"
    : "transition-[opacity,transform] duration-500 ease-out";

  let preVisibilityCls: string;
  if (exiting) {
    preVisibilityCls = "opacity-100 translate-y-0";
  } else if (entered) {
    preVisibilityCls = "opacity-100 translate-y-0";
  } else {
    preVisibilityCls = reducedMotion ? "opacity-0" : "opacity-0 translate-y-4";
  }

  const splash = (
    <div role="presentation" aria-hidden className={outerCls}>
      <div
        className="absolute inset-0 bg-background"
        style={{ backgroundColor: "hsl(var(--background))" }}
        aria-hidden
      />
      <div className="relative z-10 flex min-h-full w-full items-center justify-center p-4">
        <div className="inline-flex flex-col items-center">
          <div
            className="flex justify-center"
            style={{ width: `${FIGURE_FRAME_WIDTH_CH}ch` }}
          >
          <pre
            className={[
              "m-0 select-none text-[0.65rem] leading-tight tracking-normal text-neutral-900 dark:text-[#FFFFFF] sm:text-xs md:text-sm",
              preMotionCls,
              preVisibilityCls,
            ].join(" ")}
            style={{
              fontFamily:
                '"Courier New", Courier, "Lucida Console", "Lucida Sans Typewriter", "Nimbus Mono L", "Liberation Mono", monospace',
            }}
          >
            {ASCII_FRAMES[FRAME_SEQUENCE[frameStep]].join("\n")}
          </pre>
          </div>
          <pre
            className={[
              "mt-4 m-0 select-none text-[0.65rem] leading-tight tracking-normal text-neutral-900 dark:text-[#FFFFFF] sm:text-xs md:text-sm",
              "opacity-100",
            ].join(" ")}
            style={{
              fontFamily:
                '"Courier New", Courier, "Lucida Console", "Lucida Sans Typewriter", "Nimbus Mono L", "Liberation Mono", monospace',
            }}
          >
            {"git stretch -- origin main"}
          </pre>
        </div>
      </div>
    </div>
  );

  return createPortal(splash, document.body);
};

export default FirstVisitSplash;
