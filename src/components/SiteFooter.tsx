import { useEffect, useState } from "react";
import { GitCommitHorizontal } from "lucide-react";
import { GitHubMark } from "@/components/icons/GitHubMark";

const { commitShort, commitFull, builtAt, repository } = __BUILD_INFO__;

const repoUrl = `https://github.com/${repository}`;
const commitUrl =
  commitFull.length >= 7 ? `${repoUrl}/commit/${commitFull}` : null;

const builtDate = new Date(builtAt);
const builtDisplay = Number.isNaN(builtDate.getTime())
  ? builtAt
  : builtDate.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

type BuildStatus = "unknown" | "running";

const SiteFooter = () => {
  const [buildStatus, setBuildStatus] = useState<BuildStatus>("unknown");

  useEffect(() => {
    if (!commitFull || commitFull.length < 7) {
      return;
    }

    const controller = new AbortController();

    const fetchBuildStatus = async () => {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${repository}/actions/runs?head_sha=${commitFull}&per_page=10`,
          {
            signal: controller.signal,
            headers: {
              Accept: "application/vnd.github+json",
            },
          },
        );

        if (!response.ok) {
          setBuildStatus("unknown");
          return;
        }

        const data = (await response.json()) as {
          workflow_runs?: Array<{ status?: string }>;
        };
        const hasRunningBuild = data.workflow_runs?.some(
          (run) => run.status === "queued" || run.status === "in_progress",
        );

        setBuildStatus(hasRunningBuild ? "running" : "unknown");
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setBuildStatus("unknown");
        }
      }
    };

    fetchBuildStatus();
    const interval = window.setInterval(fetchBuildStatus, 60_000);

    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [commitFull, repository]);

  return (
    <footer
      className="relative z-10 border-t border-border/40 bg-background/80 backdrop-blur-sm mt-auto"
      role="contentinfo"
    >
      <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <GitCommitHorizontal className="w-3.5 h-3.5 shrink-0 opacity-70" aria-hidden />
            {commitUrl ? (
              <a
                href={commitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono tabular-nums hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
              >
                {commitShort}
              </a>
            ) : (
              <span className="font-mono tabular-nums">{commitShort}</span>
            )}
          </span>
          <span aria-hidden className="text-border">
            ·
          </span>
          <span>Built {builtDisplay}</span>
          {buildStatus === "running" && (
            <>
              <span aria-hidden className="text-border">
                ·
              </span>
              <span className="inline-flex items-center gap-1.5">
                <svg
                  viewBox="0 0 16 16"
                  width="14"
                  height="14"
                  className="shrink-0"
                  aria-hidden
                >
                  <circle cx="8" cy="8" r="3.5" fill="#dbab09" />
                  <circle
                    cx="8"
                    cy="8"
                    r="6.5"
                    fill="none"
                    stroke="#9e6a03"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="8"
                    cy="8"
                    r="6.5"
                    fill="none"
                    stroke="#dbab09"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeDasharray="10.2 30.6"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 8 8"
                      to="360 8 8"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </svg>
                <span>Building...</span>
              </span>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
          >
            <GitHubMark className="w-3.5 h-3.5 shrink-0 opacity-90" />
            Source
          </a>
          <span className="hidden sm:inline text-border" aria-hidden>
            ·
          </span>
          <span className="font-mono text-[10px] sm:text-xs truncate max-w-[min(100%,16rem)] sm:max-w-none">
            {repository}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
