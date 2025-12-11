import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WakaTimeStats {
  data: {
    text: string;
    total_seconds: number;
  };
}

const WakaTimeStats = () => {
  const [totalTime, setTotalTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWakaTime = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('wakatime-stats');

        if (error) {
          console.error("Error fetching WakaTime stats:", error);
          setIsLoading(false);
          return;
        }

        if (data && data.data) {
          const wakaTimeData = data as WakaTimeStats;
          setTotalTime(wakaTimeData.data.text);
        }
      } catch (error) {
        console.error("Error fetching WakaTime data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWakaTime();
  }, []);

  // Don't render anything if no data after loading
  if (!isLoading && !totalTime) {
    return null;
  }

  return (
    <div className="flex items-center justify-center mb-6">
      <div className="glass-card px-6 py-4 rounded-full hover-lift flex items-center gap-3">
        <Clock className={`w-5 h-5 text-primary ${isLoading ? 'animate-pulse' : ''}`} />
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Total coding time:
          </span>
          {isLoading ? (
            <div className="h-5 w-32 bg-muted-foreground/20 rounded animate-pulse" />
          ) : (
            <span className="text-base font-bold text-primary">
              {totalTime}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default WakaTimeStats;

