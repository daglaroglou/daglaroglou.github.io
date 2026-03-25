import { useEffect, useState, useMemo } from "react";
import { ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const GITHUB_USER = "daglaroglou";
const API_URL = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`;

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface ContributionsResponse {
  total: { lastYear: number };
  contributions: ContributionDay[];
}

const LEVEL_CLASS: Record<number, string> = {
  0: "bg-muted/70 border border-border/30",
  1: "bg-primary/25",
  2: "bg-primary/45",
  3: "bg-primary/65",
  4: "bg-primary",
};

function buildWeekColumns(days: ContributionDay[]): ContributionDay[][] {
  if (!days.length) return [];
  const map = new Map(days.map((d) => [d.date, d]));
  const first = new Date(days[0].date + "T12:00:00Z");
  const last = new Date(days[days.length - 1].date + "T12:00:00Z");
  const cells: ContributionDay[] = [];
  const padStart = first.getUTCDay();
  for (let i = 0; i < padStart; i++) {
    cells.push({ date: "", count: 0, level: 0 });
  }
  for (let d = new Date(first); d <= last; d.setUTCDate(d.getUTCDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    cells.push(map.get(key) ?? { date: key, count: 0, level: 0 });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ date: "", count: 0, level: 0 });
  }
  const weeks: ContributionDay[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

const GitHubContributions = () => {
  const [data, setData] = useState<ContributionsResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(String(res.status));
        const json: ContributionsResponse = await res.json();
        if (!cancelled) {
          setData(json);
          setError(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setData(null);
        }
      }
    };
    load();
    const interval = setInterval(load, 3600000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const weeks = useMemo(() => {
    if (!data?.contributions?.length) return [];
    return buildWeekColumns(data.contributions);
  }, [data]);

  const total = data?.total?.lastYear ?? 0;

  if (error) {
    return (
      <div className="mt-14 text-center text-sm text-muted-foreground">
        Contribution graph could not be loaded.{" "}
        <a
          href={`https://github.com/${GITHUB_USER}`}
          className="underline underline-offset-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          View profile on GitHub
        </a>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mt-14 space-y-4">
        <Skeleton className="h-4 w-48 mx-auto" />
        <div className="overflow-x-auto pb-2 -mx-1 px-1">
          <div className="flex flex-row gap-1 w-max mx-auto">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1 shrink-0">
                {Array.from({ length: 7 }).map((_, j) => (
                  <Skeleton key={j} className="w-2.5 h-2.5 rounded-sm shrink-0" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-14">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-semibold glow-text">Contribution activity</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {total.toLocaleString()} contributions in the last year
          </p>
        </div>
        <a
          href={`https://github.com/${GITHUB_USER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-card px-4 py-2 rounded-full text-sm font-medium hover-lift inline-flex items-center gap-2 self-start sm:self-center"
        >
          GitHub profile
          <ExternalLink className="w-4 h-4 opacity-70" aria-hidden />
        </a>
      </div>

      <p className="sr-only">
        {total.toLocaleString()} GitHub contributions in the last year. The following heatmap is a
        visual summary by day.
      </p>

      <div className="overflow-x-auto pb-2 -mx-1 px-1" aria-hidden>
        <div className="flex flex-row gap-1 w-max mx-auto">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1 shrink-0">
              {week.map((day, di) => {
                const hasDate = Boolean(day.date);
                const title = hasDate
                  ? `${day.date}: ${day.count} contribution${day.count === 1 ? "" : "s"}`
                  : undefined;
                return (
                  <div
                    key={`${wi}-${di}`}
                    title={title}
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm ${LEVEL_CLASS[day.level] ?? LEVEL_CLASS[0]}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-0.5">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-2.5 h-2.5 rounded-sm ${LEVEL_CLASS[level]}`}
              aria-hidden
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default GitHubContributions;
