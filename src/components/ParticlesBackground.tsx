import CanvasParticles from "@/components/CanvasParticles";

const ParticlesBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
    <CanvasParticles className="absolute inset-0 h-full w-full" />
  </div>
);

export default ParticlesBackground;
