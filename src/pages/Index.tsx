import { Link } from "react-router-dom";
import Hero from "@/components/Hero";
import GitHubRepos from "@/components/GitHubRepos";
import PCStats from "@/components/PCStats";
import LaptopStats from "@/components/LaptopStats";
import UniversityGrades from "@/components/UniversityGrades";
import BlogPreview from "@/components/BlogPreview";
import Donation from "@/components/Donation";
import ThemeToggle from "@/components/ThemeToggle";
import CheckpointSlider from "@/components/CheckpointSlider";

const Index = () => {
  return (
    <div className="min-h-screen">
      <div className="fixed top-6 left-6 z-50">
        <Link
          to="/portfolio"
          className="glass-card px-4 py-2 rounded-full hover-lift transition-all text-sm font-medium mb-6 sm:mb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Portfolio
        </Link>
      </div>
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      <CheckpointSlider />
      <section id="hero">
        <Hero />
      </section>
      <section id="github">
        <GitHubRepos />
      </section>
      <section id="pcstats">
        <PCStats />
      </section>
      <section id="laptopstats">
        <LaptopStats />
      </section>
      <section id="grades">
        <UniversityGrades />
      </section>
      <section id="blog">
        <BlogPreview />
      </section>
      <section id="donation">
        <Donation />
      </section>
    </div>
  );
};

export default Index;
