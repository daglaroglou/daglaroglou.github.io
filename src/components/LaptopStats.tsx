import MachineStats, { type StatsMetaLabels } from "@/components/MachineStats";

const LAPTOP_DEFAULT_LABELS: StatsMetaLabels = {
  os: "Debian 13 Trixie",
  display: "Built-in (15.6\") · 60 Hz",
  cpu: "i3-1215U",
  ram: "Kingston 32GB",
  gpu: "Intel UHD Graphics",
  gpu2: "—",
};

const LaptopStats = () => (
  <MachineStats
    statsTable="laptop_stats"
    title="Live Laptop Stats"
    subtitle="Real-time usage from the laptop"
    defaultLabels={LAPTOP_DEFAULT_LABELS}
    channelName="pc-stats-laptop"
    systemIcon="laptop"
    hardcodedLabels
  />
);

export default LaptopStats;
