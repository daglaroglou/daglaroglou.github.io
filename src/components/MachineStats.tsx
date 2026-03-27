import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import {
  Cpu,
  MemoryStick,
  Gauge,
  HardDrive,
  Monitor,
  Computer,
  Laptop,
  WifiOff,
  Battery,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface StatsMetaLabels {
  os: string;
  display: string;
  cpu: string;
  ram: string;
  gpu: string;
  gpu2: string;
}

export interface MachineStatsData {
  cpu_usage: number;
  ram_usage: number;
  gpu_usage?: number | null;
  gpu_temp?: number | null;
  gpu2_usage?: number | null;
  gpu2_temp?: number | null;
  storage_used_gb?: number | null;
  storage_total_gb?: number | null;
  stats_meta?: Record<string, unknown> | null;
  timestamp: string;
}

function pickMetaString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v : undefined;
}

function pickMetaNumber(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = parseFloat(v);
    if (!Number.isNaN(n)) return n;
  }
  return undefined;
}

function mergeStatsLabels(meta: unknown, defaults: StatsMetaLabels): StatsMetaLabels {
  const o =
    meta && typeof meta === "object" && !Array.isArray(meta)
      ? (meta as Record<string, unknown>)
      : {};
  return {
    os: pickMetaString(o.os) ?? defaults.os,
    display: pickMetaString(o.display) ?? defaults.display,
    cpu: pickMetaString(o.cpu) ?? defaults.cpu,
    ram: pickMetaString(o.ram) ?? defaults.ram,
    gpu: pickMetaString(o.gpu) ?? defaults.gpu,
    gpu2: pickMetaString(o.gpu2) ?? defaults.gpu2,
  };
}

function toNullableNumber(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  const n = parseFloat(String(v));
  return Number.isNaN(n) ? null : n;
}

export function normalizeMachineStatsRow(row: Record<string, unknown>): MachineStatsData {
  return {
    cpu_usage: toNullableNumber(row.cpu_usage) ?? 0,
    ram_usage: toNullableNumber(row.ram_usage) ?? 0,
    gpu_usage: toNullableNumber(row.gpu_usage),
    gpu_temp: toNullableNumber(row.gpu_temp),
    gpu2_usage: toNullableNumber(row.gpu2_usage),
    gpu2_temp: toNullableNumber(row.gpu2_temp),
    storage_used_gb: toNullableNumber(row.storage_used_gb),
    storage_total_gb: toNullableNumber(row.storage_total_gb),
    stats_meta:
      row.stats_meta && typeof row.stats_meta === "object"
        ? (row.stats_meta as Record<string, unknown>)
        : null,
    timestamp: String(row.timestamp ?? ""),
  };
}

function formatStorageGb(gb: number): string {
  if (!Number.isFinite(gb) || gb < 0) return "—";
  if (gb >= 1024) return `${(gb / 1024).toFixed(2)} TB`;
  if (gb >= 100) return `${gb.toFixed(0)} GB`;
  return `${gb.toFixed(1)} GB`;
}

function StatsGroup({
  title,
  description,
  children,
  style,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div className="space-y-4 animate-fade-in" style={style}>
      <div className="px-1">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 shadow-sm backdrop-blur-md md:p-6">
        {children}
      </div>
    </div>
  );
}

interface AnimatedNumberProps {
  value: number;
  colorClass: string;
}

const AnimatedNumber = ({ value, colorClass }: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = useState(value.toFixed(1));

  useEffect(() => {
    const targetString = value.toFixed(1);
    let iterations = 0;
    const maxIterations = targetString.length;

    const interval = setInterval(() => {
      setDisplayValue(() => {
        return targetString
          .split("")
          .map((char, index) => {
            if (index < iterations) {
              return targetString[index];
            }
            if (char === ".") {
              return ".";
            }
            return Math.floor(Math.random() * 10).toString();
          })
          .join("");
      });

      iterations += 0.5;

      if (iterations >= maxIterations) {
        clearInterval(interval);
        setDisplayValue(targetString);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [value]);

  return (
    <span
      className={`text-4xl font-bold ${colorClass} transition-all duration-300 group-hover:scale-110`}
    >
      {displayValue}
    </span>
  );
};

const STALE_AFTER_SECONDS = 60;

export type StatsTableName = "pc_stats" | "laptop_stats";

export interface MachineStatsProps {
  /** Separate DB tables — desktop uses pc_stats, laptop uses laptop_stats. */
  statsTable: StatsTableName;
  title: string;
  subtitle: string;
  defaultLabels: StatsMetaLabels;
  /** Realtime channel id — unique per section. */
  channelName: string;
  systemIcon?: "computer" | "laptop";
  /** When true, always show `defaultLabels` (ignore `stats_meta` from the API). */
  hardcodedLabels?: boolean;
}

const MachineStats = ({
  statsTable,
  title,
  subtitle,
  defaultLabels,
  channelName,
  systemIcon = "computer",
  hardcodedLabels = false,
}: MachineStatsProps) => {
  const [stats, setStats] = useState<MachineStatsData | null>(null);
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  const SystemIcon: LucideIcon = systemIcon === "laptop" ? Laptop : Computer;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from(statsTable)
          .select("*")
          .order("timestamp", { ascending: false })
          .order("id", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error(`Error fetching stats (${statsTable}):`, error);
        }

        if (data) {
          setStats(normalizeMachineStatsRow(data as Record<string, unknown>));
        } else {
          setStats(null);
        }
      } finally {
        setInitialFetchDone(true);
      }
    };

    fetchStats();
    const fetchInterval = setInterval(fetchStats, 5000);

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: statsTable,
        },
        (payload) => {
          setStats(normalizeMachineStatsRow(payload.new as Record<string, unknown>));
        }
      )
      .subscribe();

    return () => {
      clearInterval(fetchInterval);
      supabase.removeChannel(channel);
    };
  }, [statsTable, channelName]);

  const getUsageColor = (usage: number) => {
    if (usage < 50) return "text-green-500";
    if (usage < 75) return "text-yellow-500";
    return "text-red-500";
  };

  const getTempColor = (celsius: number) => {
    if (celsius < 65) return "text-green-500";
    if (celsius < 80) return "text-yellow-500";
    return "text-red-500";
  };

  const timeDiff = stats
    ? Math.floor((Date.now() - new Date(stats.timestamp).getTime()) / 1000)
    : 0;
  const isStale = stats ? timeDiff > STALE_AFTER_SECONDS : false;
  const isOffline = !stats || isStale;

  if (!stats && !initialFetchDone) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 glow-text">{title}</h2>
          <p className="text-muted-foreground">Loading…</p>
        </div>
      </section>
    );
  }

  if (isOffline) {
    return (
      <section className="py-20 px-4">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-center text-3xl font-bold md:text-4xl glow-text">{title}</h2>
          <div
            className="mx-auto max-w-sm animate-fade-in rounded-2xl border border-dashed border-muted-foreground/25 bg-gradient-to-b from-muted/15 to-muted/5 px-8 py-10 text-center shadow-[inset_0_1px_0_0_hsl(var(--border)/0.35)] backdrop-blur-md md:max-w-md md:px-10 md:py-12"
            role="status"
            aria-live="polite"
          >
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-muted/25 text-muted-foreground shadow-sm">
              <WifiOff className="h-7 w-7" strokeWidth={1.5} aria-hidden />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground/90">
              Status
            </p>
            <div className="mt-3 flex items-center justify-center gap-2.5">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-muted-foreground/35 opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-muted-foreground/55" />
              </span>
              <p className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                Offline
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const storageUsed = stats.storage_used_gb ?? 0;
  const storageTotal = stats.storage_total_gb ?? 0;
  const storagePercent =
    storageTotal > 0 ? Math.min(100, (storageUsed / storageTotal) * 100) : 0;
  const hasStorage = storageTotal > 0;

  const labels = hardcodedLabels
    ? defaultLabels
    : mergeStatsLabels(stats.stats_meta, defaultLabels);
  const hasSecondGpu = stats.gpu2_usage != null || stats.gpu2_temp != null;

  const meta = stats.stats_meta;
  const batteryPercent = meta ? pickMetaNumber(meta.battery_percent) : undefined;
  const batteryStatus = meta ? pickMetaString(meta.battery_status) : undefined;
  const showBattery = batteryPercent != null || Boolean(batteryStatus);

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 glow-text">{title}</h2>
          <p className="text-muted-foreground">
            {subtitle}
            <span className="ml-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse-glow" />
              <span className="ml-2">Live</span>
            </span>
          </p>
          <div className="mx-auto mt-5 flex max-w-xl flex-wrap items-stretch justify-center gap-2.5 sm:gap-3">
            <div className="flex min-w-[min(100%,14rem)] flex-1 items-center gap-2.5 rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2.5 text-left shadow-sm backdrop-blur-sm sm:min-w-0 sm:flex-initial">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <SystemIcon className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-widest text-primary/70">
                  OS
                </p>
                <p className="text-sm font-semibold leading-snug text-foreground">{labels.os}</p>
              </div>
            </div>
            <div className="flex min-w-[min(100%,14rem)] flex-1 items-center gap-2.5 rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2.5 text-left shadow-sm backdrop-blur-sm sm:min-w-0 sm:flex-initial">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Monitor className="h-4 w-4" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  Display
                </p>
                <p className="text-sm font-semibold leading-snug text-foreground">
                  {labels.display}
                </p>
              </div>
            </div>
            {showBattery ? (
              <div className="flex min-w-[min(100%,14rem)] flex-1 items-center gap-2.5 rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2.5 text-left shadow-sm backdrop-blur-sm sm:min-w-0 sm:flex-initial">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Battery className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    Battery
                  </p>
                  <p className="text-sm font-semibold leading-snug text-foreground">
                    {batteryPercent != null ? `${batteryPercent.toFixed(0)}%` : "—"}
                    {batteryStatus ? (
                      <span className="ml-1.5 font-normal text-muted-foreground">
                        · {batteryStatus}
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mx-auto flex max-w-5xl flex-col gap-10">
          <StatsGroup
            title="System"
            description="CPU, memory, and combined disk capacity"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="glass-card group cursor-pointer p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2.5 transition-colors group-hover:bg-primary/20">
                    <Cpu className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold leading-tight">CPU</h4>
                    <p className="text-xs text-muted-foreground">{labels.cpu}</p>
                  </div>
                </div>
                <div className="flex items-end gap-1.5">
                  <AnimatedNumber value={stats.cpu_usage} colorClass={getUsageColor(stats.cpu_usage)} />
                  <span className="mb-0.5 text-xl text-muted-foreground">%</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                    style={{
                      width: `${stats.cpu_usage}%`,
                      boxShadow: "0 0 8px hsl(var(--primary) / 0.45)",
                    }}
                  />
                </div>
              </Card>

              <Card className="glass-card group cursor-pointer p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2.5 transition-colors group-hover:bg-primary/20">
                    <MemoryStick className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold leading-tight">RAM</h4>
                    <p className="text-xs text-muted-foreground">{labels.ram}</p>
                  </div>
                </div>
                <div className="flex items-end gap-1.5">
                  <AnimatedNumber value={stats.ram_usage} colorClass={getUsageColor(stats.ram_usage)} />
                  <span className="mb-0.5 text-xl text-muted-foreground">%</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                    style={{
                      width: `${stats.ram_usage}%`,
                      boxShadow: "0 0 8px hsl(var(--primary) / 0.45)",
                    }}
                  />
                </div>
              </Card>

              <Card className="glass-card group cursor-pointer p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg sm:col-span-2 lg:col-span-1">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2.5 transition-colors group-hover:bg-primary/20">
                    <HardDrive className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold leading-tight">Storage</h4>
                    <p className="text-xs text-muted-foreground">
                      {hasStorage
                        ? `${formatStorageGb(storageUsed)} / ${formatStorageGb(storageTotal)} combined`
                        : "All drives combined"}
                    </p>
                  </div>
                </div>
                <div className="flex items-end gap-1.5">
                  <AnimatedNumber value={storagePercent} colorClass={getUsageColor(storagePercent)} />
                  <span className="mb-0.5 text-xl text-muted-foreground">%</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                    style={{
                      width: `${storagePercent}%`,
                      boxShadow: "0 0 8px hsl(var(--primary) / 0.45)",
                    }}
                  />
                </div>
              </Card>
            </div>
          </StatsGroup>

          <StatsGroup
            title="Graphics"
            description={
              hasSecondGpu ? "Per-GPU load and temperature" : "GPU load and temperature"
            }
            style={{ animationDelay: "80ms" }}
          >
            <div className={`grid grid-cols-1 gap-4 ${hasSecondGpu ? "lg:grid-cols-2" : ""}`}>
              <Card className="glass-card group overflow-hidden p-0 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg">
                <div className="flex items-center gap-3 border-b border-border/40 bg-primary/5 px-5 py-4">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <Gauge className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{labels.gpu}</h4>
                    <p className="text-xs text-muted-foreground">
                      {hasSecondGpu ? "GPU 1" : "GPU"}
                    </p>
                  </div>
                </div>
                <div className="grid gap-6 p-5 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Load
                    </p>
                    {stats.gpu_usage != null ? (
                      <>
                        <div className="flex items-end gap-1.5">
                          <AnimatedNumber
                            value={stats.gpu_usage}
                            colorClass={getUsageColor(stats.gpu_usage)}
                          />
                          <span className="mb-0.5 text-xl text-muted-foreground">%</span>
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                            style={{
                              width: `${stats.gpu_usage}%`,
                              boxShadow: "0 0 8px hsl(var(--primary) / 0.45)",
                            }}
                          />
                        </div>
                      </>
                    ) : (
                      <p className="text-4xl font-bold text-muted-foreground">—</p>
                    )}
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Temperature
                    </p>
                    {stats.gpu_temp != null ? (
                      <div className="flex items-end gap-1.5">
                        <AnimatedNumber
                          value={stats.gpu_temp}
                          colorClass={getTempColor(stats.gpu_temp)}
                        />
                        <span className="mb-0.5 text-xl text-muted-foreground">°C</span>
                      </div>
                    ) : (
                      <p className="text-4xl font-bold text-muted-foreground">—</p>
                    )}
                  </div>
                </div>
              </Card>

              {hasSecondGpu ? (
                <Card className="glass-card group overflow-hidden p-0 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg">
                  <div className="flex items-center gap-3 border-b border-border/40 bg-primary/5 px-5 py-4">
                    <div className="rounded-lg bg-primary/10 p-2.5">
                      <Gauge className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{labels.gpu2}</h4>
                      <p className="text-xs text-muted-foreground">GPU 2</p>
                    </div>
                  </div>
                  <div className="grid gap-6 p-5 sm:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Load
                      </p>
                      {stats.gpu2_usage != null ? (
                        <>
                          <div className="flex items-end gap-1.5">
                            <AnimatedNumber
                              value={stats.gpu2_usage}
                              colorClass={getUsageColor(stats.gpu2_usage)}
                            />
                            <span className="mb-0.5 text-xl text-muted-foreground">%</span>
                          </div>
                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                              style={{
                                width: `${stats.gpu2_usage}%`,
                                boxShadow: "0 0 8px hsl(var(--primary) / 0.45)",
                              }}
                            />
                          </div>
                        </>
                      ) : (
                        <p className="text-4xl font-bold text-muted-foreground">—</p>
                      )}
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Temperature
                      </p>
                      {stats.gpu2_temp != null ? (
                        <div className="flex items-end gap-1.5">
                          <AnimatedNumber
                            value={stats.gpu2_temp}
                            colorClass={getTempColor(stats.gpu2_temp)}
                          />
                          <span className="mb-0.5 text-xl text-muted-foreground">°C</span>
                        </div>
                      ) : (
                        <p className="text-4xl font-bold text-muted-foreground">—</p>
                      )}
                    </div>
                  </div>
                </Card>
              ) : null}
            </div>
          </StatsGroup>
        </div>
      </div>
    </section>
  );
};

export default MachineStats;
