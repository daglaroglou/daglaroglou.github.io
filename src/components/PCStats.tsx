import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Cpu, MemoryStick, Gauge, HardDrive } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PCStatsData {
  cpu_usage: number;
  ram_usage: number;
  gpu_usage?: number | null;
  gpu_temp?: number | null;
  gpu2_usage?: number | null;
  gpu2_temp?: number | null;
  storage_used_gb?: number | null;
  storage_total_gb?: number | null;
  timestamp: string;
}

/** PostgREST often returns DECIMAL as strings; realtime payloads must match SELECT shape. */
function toNullableNumber(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  const n = parseFloat(String(v));
  return Number.isNaN(n) ? null : n;
}

function normalizePcStatsRow(row: Record<string, unknown>): PCStatsData {
  return {
    cpu_usage: toNullableNumber(row.cpu_usage) ?? 0,
    ram_usage: toNullableNumber(row.ram_usage) ?? 0,
    gpu_usage: toNullableNumber(row.gpu_usage),
    gpu_temp: toNullableNumber(row.gpu_temp),
    gpu2_usage: toNullableNumber(row.gpu2_usage),
    gpu2_temp: toNullableNumber(row.gpu2_temp),
    storage_used_gb: toNullableNumber(row.storage_used_gb),
    storage_total_gb: toNullableNumber(row.storage_total_gb),
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
          .split('')
          .map((char, index) => {
            if (index < iterations) {
              return targetString[index];
            }
            // Keep the decimal point
            if (char === '.') {
              return '.';
            }
            // Random digit for numbers
            return Math.floor(Math.random() * 10).toString();
          })
          .join('');
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
    <span className={`text-4xl font-bold ${colorClass} transition-all duration-300 group-hover:scale-110`}>
      {displayValue}
    </span>
  );
};

const PCStats = () => {
  const [stats, setStats] = useState<PCStatsData | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      console.log("Fetching PC stats...");
      const { data, error } = await supabase
        .from("pc_stats")
        .select("*")
        .order("timestamp", { ascending: false })
        .order("id", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching stats:", error);
      }
      
      if (data) {
        const normalized = normalizePcStatsRow(data as Record<string, unknown>);
        console.log("Received stats:", normalized);
        setStats(normalized);
      } else {
        console.log("No data received");
      }
    };

    fetchStats();
    const fetchInterval = setInterval(fetchStats, 5000); // Update every 5 seconds

    // Set up real-time subscription
    const channel = supabase
      .channel("pc-stats-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "pc_stats",
        },
        (payload) => {
          setStats(normalizePcStatsRow(payload.new as Record<string, unknown>));
        }
      )
      .subscribe();

    return () => {
      clearInterval(fetchInterval);
      supabase.removeChannel(channel);
    };
  }, []);

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

  if (!stats) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center glow-text">
            Live PC Stats
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Waiting for data...
          </p>
        </div>
      </section>
    );
  }

  const timeDiff = Math.floor((Date.now() - new Date(stats.timestamp).getTime()) / 1000);
  const isStale = timeDiff > 60;

  const storageUsed = stats.storage_used_gb ?? 0;
  const storageTotal = stats.storage_total_gb ?? 0;
  const storagePercent =
    storageTotal > 0 ? Math.min(100, (storageUsed / storageTotal) * 100) : 0;
  const hasStorage = storageTotal > 0;

  const formatTimeDiff = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 glow-text">
            Live PC Stats
          </h2>
          <p className="text-muted-foreground">
            Real-time usage from my rig
            {!isStale && (
              <span className="ml-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse-glow" />
                <span className="ml-2">Live</span>
              </span>
            )}
          </p>
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
                    <p className="text-xs text-muted-foreground">Intel i5 11600K</p>
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
                    <p className="text-xs text-muted-foreground">Corsair 32GB</p>
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
            description="Per-GPU load and temperature"
            style={{ animationDelay: "80ms" }}
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card className="glass-card group overflow-hidden p-0 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg">
                <div className="flex items-center gap-3 border-b border-border/40 bg-primary/5 px-5 py-4">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <Gauge className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">NVIDIA GTX 1660 Super</h4>
                    <p className="text-xs text-muted-foreground">GPU 1</p>
                  </div>
                </div>
                <div className="grid gap-6 p-5 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Load
                    </p>
                    <div className="flex items-end gap-1.5">
                      <AnimatedNumber
                        value={stats.gpu_usage ?? 0}
                        colorClass={getUsageColor(stats.gpu_usage ?? 0)}
                      />
                      <span className="mb-0.5 text-xl text-muted-foreground">%</span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                        style={{
                          width: `${stats.gpu_usage ?? 0}%`,
                          boxShadow: "0 0 8px hsl(var(--primary) / 0.45)",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Temperature
                    </p>
                    <div className="flex items-end gap-1.5">
                      <AnimatedNumber
                        value={stats.gpu_temp ?? 0}
                        colorClass={getTempColor(stats.gpu_temp ?? 0)}
                      />
                      <span className="mb-0.5 text-xl text-muted-foreground">°C</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="glass-card group overflow-hidden p-0 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg">
                <div className="flex items-center gap-3 border-b border-border/40 bg-primary/5 px-5 py-4">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <Gauge className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">NVIDIA RTX 3060</h4>
                    <p className="text-xs text-muted-foreground">GPU 2</p>
                  </div>
                </div>
                <div className="grid gap-6 p-5 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Load
                    </p>
                    <div className="flex items-end gap-1.5">
                      <AnimatedNumber
                        value={stats.gpu2_usage ?? 0}
                        colorClass={getUsageColor(stats.gpu2_usage ?? 0)}
                      />
                      <span className="mb-0.5 text-xl text-muted-foreground">%</span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                        style={{
                          width: `${stats.gpu2_usage ?? 0}%`,
                          boxShadow: "0 0 8px hsl(var(--primary) / 0.45)",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Temperature
                    </p>
                    <div className="flex items-end gap-1.5">
                      <AnimatedNumber
                        value={stats.gpu2_temp ?? 0}
                        colorClass={getTempColor(stats.gpu2_temp ?? 0)}
                      />
                      <span className="mb-0.5 text-xl text-muted-foreground">°C</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </StatsGroup>
        </div>

        {isStale && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            Last updated {formatTimeDiff(timeDiff)} ago
          </p>
        )}
      </div>
    </section>
  );
};

export default PCStats;