import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Cpu, MemoryStick, Gauge } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PCStatsData {
  cpu_usage: number;
  ram_usage: number;
  gpu_usage?: number;
  gpu_temp?: number;
  timestamp: string;
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
      const { data, error } = await supabase
        .from("pc_stats")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setStats(data);
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
          setStats(payload.new as PCStatsData);
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

  if (!stats) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
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
    <section className="py-20 px-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-4xl mx-auto">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CPU Usage */}
          <Card className="glass-card p-6 hover-lift transition-all duration-300 hover:scale-105 animate-fade-in group cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                <Cpu className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold transition-colors duration-300 group-hover:text-primary">CPU Usage</h3>
                <p className="text-xs text-muted-foreground">Intel i5 11600K 3.9GHz</p>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <AnimatedNumber value={stats.cpu_usage} colorClass={getUsageColor(stats.cpu_usage)} />
              <span className="text-2xl text-muted-foreground mb-1">%</span>
            </div>
            <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                style={{ width: `${stats.cpu_usage}%` }}
              />
            </div>
          </Card>

          {/* RAM Usage */}
          <Card className="glass-card p-6 hover-lift transition-all duration-300 hover:scale-105 animate-fade-in group cursor-pointer" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                <MemoryStick className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold transition-colors duration-300 group-hover:text-primary">RAM Usage</h3>
                <p className="text-xs text-muted-foreground">Corsair 32GB</p>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <AnimatedNumber value={stats.ram_usage} colorClass={getUsageColor(stats.ram_usage)} />
              <span className="text-2xl text-muted-foreground mb-1">%</span>
            </div>
            <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                style={{ width: `${stats.ram_usage}%` }}
              />
            </div>
          </Card>

          {/* GPU Usage (if available) */}
          <Card className="glass-card p-6 hover-lift transition-all duration-300 hover:scale-105 animate-fade-in group cursor-pointer" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                <Gauge className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold transition-colors duration-300 group-hover:text-primary">GPU Usage</h3>
                <p className="text-xs text-muted-foreground">Nvidia GTX 1660 6GB Super</p>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <AnimatedNumber value={stats.gpu_usage ?? 0} colorClass={getUsageColor(stats.gpu_usage ?? 0)} />
              <span className="text-2xl text-muted-foreground mb-1">%</span>
            </div>
            <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                style={{ width: `${stats.gpu_usage ?? 0}%` }}
              />
            </div>
          </Card>

          {/* GPU Temp (if available) */}
          <Card className="glass-card p-6 hover-lift transition-all duration-300 hover:scale-105 animate-fade-in group cursor-pointer" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                <Gauge className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold transition-colors duration-300 group-hover:text-primary">GPU Temperature</h3>
                <p className="text-xs text-muted-foreground">Nvidia GTX 1660 6GB Super</p>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <AnimatedNumber value={stats.gpu_temp ?? 0} colorClass={getUsageColor(((stats.gpu_temp ?? 0) / 100) * 100)} />
              <span className="text-2xl text-muted-foreground mb-1">°C</span>
            </div>
          </Card>
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