import ThemeToggle from "./ThemeToggle";
import SoundToggle from "./SoundToggle";
import CRTToggle from "./CRTToggle";

const ControlsGroup = () => {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col sm:flex-row gap-3">
      <CRTToggle />
      <SoundToggle />
      <ThemeToggle />
    </div>
  );
};

export default ControlsGroup;
