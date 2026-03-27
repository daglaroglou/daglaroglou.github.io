import MachineStats, { type StatsMetaLabels } from "@/components/MachineStats";

const DEFAULT_STATS_LABELS: StatsMetaLabels = {
  os: "Windows 11 IoT LTSC",
  display: 'MSI 24" · 144 Hz',
  cpu: "i5 11600K",
  ram: "Corsair 32GB",
  gpu: "NVIDIA GTX 1660 Super",
  gpu2: "NVIDIA RTX 3060",
};

const PCStats = () => (
  <MachineStats
    statsTable="pc_stats"
    title="Live PC Stats"
    subtitle="Real-time usage from the desktop"
    defaultLabels={DEFAULT_STATS_LABELS}
    channelName="pc-stats-desktop"
    systemIcon="computer"
  />
);

export default PCStats;
