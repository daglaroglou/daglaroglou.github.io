import { GitBranch, GitCommitHorizontal } from "lucide-react";

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

const SiteFooter = () => {
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
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
          >
            <GitBranch className="w-3.5 h-3.5 shrink-0" aria-hidden />
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
