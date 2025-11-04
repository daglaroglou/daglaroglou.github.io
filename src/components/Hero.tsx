import { useEffect, useState, useMemo } from "react";
import { Github, Mail, Gamepad2, Music, Code, Download } from "lucide-react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Container } from "@tsparticles/engine";

interface LanyardData {
  discord_user: {
    username: string;
    discriminator: string;
    avatar: string;
    id: string;
    global_name?: string;
  };
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities: Array<{
    name: string;
    type: number;
    state?: string;
    details?: string;
    assets?: {
      large_image?: string;
      large_text?: string;
      small_image?: string;
      small_text?: string;
    };
    timestamps?: {
      start?: number;
      end?: number;
    };
    application_id?: string;
  }>;
  listening_to_spotify: boolean;
  spotify?: {
    song: string;
    artist: string;
    album: string;
    album_art_url: string;
    timestamps: {
      start: number;
      end: number;
    };
  };
}

const Hero = () => {
  const [lanyardData, setLanyardData] = useState<LanyardData | null>(null);
  const [particlesInit, setParticlesInit] = useState(false);
  const [displayText, setDisplayText] = useState("daglaroglou");
  const [isHovering, setIsHovering] = useState(false);
  
  // Subtitle rotation state
  const subtitles = [
    "Full-stack developer & tech enthusiast",
    "Passionate about clean code",
    "Open source contributor",
    "Always learning, always growing"
  ];
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [displaySubtitle, setDisplaySubtitle] = useState(subtitles[0]);
  const [isTypingSubtitle, setIsTypingSubtitle] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setParticlesInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log(container);
  };

  const particlesOptions = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "bubble",
          },
          onHover: {
            enable: true,
            mode: "bubble",
          },
        },
        modes: {
          bubble: {
            distance: 200,
            size: 8,
            duration: 2,
            opacity: 0.8,
          },
        },
      },
      particles: {
        color: {
          value: "#ffffff",
        },
        links: {
          enable: false,
        },
        move: {
          direction: "top" as const,
          enable: true,
          outModes: {
            default: "out" as const,
          },
          random: false,
          speed: { min: 0.3, max: 1 },
          straight: false,
          warp: true,
        },
        number: {
          density: {
            enable: true,
          },
          value: 40,
        },
        opacity: {
          value: { min: 0.2, max: 0.6 },
          animation: {
            enable: true,
            speed: 0.8,
            minimumValue: 0.1,
            sync: false,
          },
        },
        rotate: {
          value: { min: 0, max: 360 },
          animation: {
            enable: true,
            speed: 5,
            sync: false,
          },
        },
        shape: {
          type: ["circle", "square", "triangle", "polygon"],
          options: {
            polygon: {
              sides: 6,
            },
          },
        },
        size: {
          value: { min: 2, max: 6 },
          animation: {
            enable: false,
          },
        },
        wobble: {
          enable: true,
          distance: 10,
          speed: 3,
        },
        roll: {
          enable: true,
          speed: 2,
        },
      },
      detectRetina: true,
    }),
    [],
  );

  useEffect(() => {
    const fetchLanyard = async () => {
      try {
        const response = await fetch("https://api.lanyard.rest/v1/users/852825042630475827");
        const data = await response.json();
        if (data.success) {
          setLanyardData(data.data);
        }
      } catch (error) {
        console.error("Error fetching Lanyard data:", error);
      }
    };

    fetchLanyard();
    const interval = setInterval(fetchLanyard, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "idle":
        return "bg-yellow-500";
      case "dnd":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Online";
      case "idle":
        return "Idle";
      case "dnd":
        return "Do Not Disturb";
      case "offline":
        return "Offline";
      default:
        return "Unknown";
    }
  };

  const getTimeElapsed = (startTime: number) => {
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const [, forceUpdate] = useState({});
  useEffect(() => {
    const interval = setInterval(() => forceUpdate({}), 1000);
    return () => clearInterval(interval);
  }, []);

  const getCurrentActivity = () => {
    if (!lanyardData?.activities || lanyardData.activities.length === 0) {
      return null;
    }
    
    // Type 0 is playing a game, Type 2 is listening to Spotify
    const activity = lanyardData.activities.find(a => a.type === 0);
    return activity;
  };

  const activity = getCurrentActivity();

  // Anagram effect on hover
  useEffect(() => {
    const originalText = "daglaroglou";
    let intervalId: NodeJS.Timeout;

    if (isHovering) {
      let iterations = 0;
      intervalId = setInterval(() => {
        setDisplayText((prev) => {
          const chars = originalText.split('');
          return chars
            .map((char, index) => {
              if (index < iterations) {
                return originalText[index];
              }
              return String.fromCharCode(97 + Math.floor(Math.random() * 26));
            })
            .join('');
        });

        iterations += 1 / 3;

        if (iterations >= originalText.length) {
          clearInterval(intervalId);
          setDisplayText(originalText);
        }
      }, 30);
    } else {
      setDisplayText(originalText);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isHovering]);

  // Subtitle cycling with anagram effect
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const animateSubtitle = (targetText: string, callback?: () => void) => {
      setIsTypingSubtitle(true);
      let iterations = 0;
      const intervalId = setInterval(() => {
        setDisplaySubtitle(() => {
          const chars = targetText.split('');
          return chars
            .map((char, index) => {
              if (index < iterations) {
                return targetText[index];
              }
              // Keep spaces and special characters
              if (char === ' ' || !/[a-zA-Z]/.test(char)) {
                return char;
              }
              // Random character for letters
              const isUpperCase = char === char.toUpperCase();
              const randomChar = String.fromCharCode(
                (isUpperCase ? 65 : 97) + Math.floor(Math.random() * 26)
              );
              return randomChar;
            })
            .join('');
        });

        iterations += 1 / 2;

        if (iterations >= targetText.length) {
          clearInterval(intervalId);
          setDisplaySubtitle(targetText);
          setIsTypingSubtitle(false);
          // Call callback when animation is complete
          if (callback) callback();
        }
      }, 30);
    };

    const cycleToNext = (currentIndex: number) => {
      const nextIndex = (currentIndex + 1) % subtitles.length;
      animateSubtitle(subtitles[nextIndex], () => {
        // Wait 2 seconds after animation completes, then cycle to next
        timeoutId = setTimeout(() => {
          setCurrentSubtitleIndex(nextIndex);
          cycleToNext(nextIndex);
        }, 2000);
      });
    };

    // Initial animation
    animateSubtitle(subtitles[0], () => {
      // Wait 2 seconds after initial animation, then start cycling
      timeoutId = setTimeout(() => {
        setCurrentSubtitleIndex(1);
        cycleToNext(0);
      }, 2000);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Memoize particles to prevent re-renders - only depends on init state
  const particlesComponent = useMemo(() => {
    if (!particlesInit) return null;
    return (
      <div className="absolute inset-0 z-0" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
        <Particles
          id="tsparticles"
          particlesLoaded={particlesLoaded}
          options={particlesOptions}
          className="absolute inset-0"
        />
      </div>
    );
  }, [particlesInit]);

  return (
    <section className="min-h-screen flex items-start justify-center px-4 pt-16 pb-32 relative overflow-hidden">
      {/* Particles background - memoized to prevent re-renders */}
      {particlesComponent}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none z-0" />
      
      <div className="max-w-4xl w-full relative z-10 animate-fade-in">
        <div className="text-center space-y-8">
          <div className="space-y-4 animate-float">
            <h1 
              className="text-5xl md:text-7xl font-bold glow-text glitch-text"
              data-text={displayText}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {displayText}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-mono">
              {displaySubtitle}
            </p>
          </div>

          {/* Discord Rich Presence */}
          {lanyardData && (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="flex items-center gap-3 glass-card px-6 py-3 rounded-full hover-lift">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(lanyardData.discord_status)} animate-pulse`} />
                  <span className="text-sm font-medium">
                    {getStatusText(lanyardData.discord_status)}
                  </span>
                </div>

                {activity && (
                  <div className="glass-card px-6 py-3 rounded-full hover-lift flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {activity.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Rich Activity Details */}
              {activity && activity.details && (
                <div className="glass-card p-6 rounded-xl max-w-md mx-auto hover-lift">
                  <div className="flex items-start gap-4">
                    {activity.assets?.large_image && (
                      <div className="relative flex-shrink-0">
                        <img 
                          src={activity.assets.large_image.startsWith('mp:') 
                            ? `https://media.discordapp.net/${activity.assets.large_image.replace('mp:', '')}`
                            : `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`
                          }
                          alt={activity.assets.large_text || activity.name}
                          className="w-16 h-16 rounded-lg"
                        />
                        {activity.assets.small_image && (
                          <img 
                            src={activity.assets.small_image.startsWith('mp:') 
                              ? `https://media.discordapp.net/${activity.assets.small_image.replace('mp:', '')}`
                              : `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.small_image}.png`
                            }
                            alt={activity.assets.small_text || ''}
                            className="absolute bottom-0 right-0 w-7 h-7 rounded-full border-2 border-[#1a1a1a] bg-[#1a1a1a] translate-x-1 translate-y-1"
                            title={activity.assets.small_text}
                          />
                        )}
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <Code className="w-4 h-4 text-muted-foreground" />
                        <p className="font-semibold">{activity.name}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.details}</p>
                      {activity.state && (
                        <p className="text-xs text-muted-foreground mt-1">{activity.state}</p>
                      )}
                      {activity.timestamps?.start && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {getTimeElapsed(activity.timestamps.start)} elapsed
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Spotify Now Playing */}
              {lanyardData.listening_to_spotify && lanyardData.spotify && (
                <div className="glass-card p-6 rounded-xl max-w-md mx-auto hover-lift">
                  <div className="flex items-start gap-4">
                    <img 
                      src={lanyardData.spotify.album_art_url} 
                      alt={lanyardData.spotify.album}
                      className="w-16 h-16 rounded-lg"
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <Music className="w-4 h-4 text-muted-foreground" />
                        <p className="font-semibold text-sm">Listening to Spotify</p>
                      </div>
                      <p className="text-sm font-medium">{lanyardData.spotify.song}</p>
                      <p className="text-xs text-muted-foreground">{lanyardData.spotify.artist}</p>
                      {lanyardData.spotify.timestamps && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {getTimeElapsed(lanyardData.spotify.timestamps.start)} / {Math.floor((lanyardData.spotify.timestamps.end - lanyardData.spotify.timestamps.start) / 1000 / 60)}:{String(Math.floor(((lanyardData.spotify.timestamps.end - lanyardData.spotify.timestamps.start) / 1000) % 60)).padStart(2, '0')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Social Media Links */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a 
              href="https://github.com/daglaroglou" 
              target="_blank" 
              rel="noopener noreferrer"
              className="glass-card p-3 rounded-full hover-lift transition-all hover:scale-110"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a 
              href="mailto:christos.daglaroglou@gmail.com"
              className="glass-card p-3 rounded-full hover-lift transition-all hover:scale-110"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
            <a 
              href="https://x.com/_daglaroglou_" 
              target="_blank" 
              rel="noopener noreferrer"
              className="glass-card p-3 rounded-full hover-lift transition-all hover:scale-110"
              aria-label="X"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a 
              href="https://instagram.com/_daglaroglou_" 
              target="_blank" 
              rel="noopener noreferrer"
              className="glass-card p-3 rounded-full hover-lift transition-all hover:scale-110"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a 
              href="https://www.facebook.com/profile.php?id=100094342959163" 
              target="_blank" 
              rel="noopener noreferrer"
              className="glass-card p-3 rounded-full hover-lift transition-all hover:scale-110"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>

          {/* Download Resume Button */}
          <div className="flex items-center justify-center">
            <a 
              href="/resume.pdf"
              download
              className="glass-card px-6 py-3 rounded-full hover-lift transition-all hover:scale-110 flex items-center gap-2"
              aria-label="Download Resume"
            >
              <Download className="w-5 h-5" />
              <span className="font-medium">Download Resume</span>
            </a>
          </div>

          {/* Timeline - Metro Station Style */}
          <div className="mt-12 relative max-w-3xl mx-auto">
            <div className="relative px-8 py-8">
              {/* Metro line */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-primary/20 blur-sm" />
              
              {/* Stations */}
              <div className="relative flex justify-between items-center">
                {[
                  { year: "2021", event: "Joined @Magnimont", description: "Joined Magnimont, a software developer." },
                  { year: "2023", event: "Graduated from High School", description: "Graduated from Efkleidis Vocational High School." },
                  { year: "2024", event: "Went in Univercity of Macedonia", description: "Went in Univercity of Macedonia, Applied Informatics Department." },
                  { year: "2025", event: "Released my first project", description: "Released Aesir, a software to flash custom firmware to Samsung devices." },
                ].map((item, index) => (
                  <div key={item.year} className="flex-1 flex flex-col items-center group relative">
                    {/* Station circle - on the line */}
                    <div className="relative z-10">
                      <div className="w-6 h-6 rounded-full bg-background border-4 border-primary transition-all duration-300 group-hover:scale-125 group-hover:border-primary/80 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
                    </div>
                    
                    {/* Year - Always visible */}
                    <div className="absolute top-full mt-1">
                      <div className="glass-card px-3 py-1.5 rounded-lg">
                        <p className="text-sm font-bold text-primary whitespace-nowrap">{item.year}</p>
                      </div>
                    </div>
                    
                    {/* Station info - Show on hover */}
                    <div className="absolute top-full mt-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center space-y-1 px-2 pointer-events-none">
                      <p className="text-sm font-bold whitespace-nowrap">{item.event}</p>
                      <p className="text-xs text-muted-foreground leading-tight">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="relative max-w-3xl mx-auto">
            <div className="text-center space-y-4 mb-8 mt-48">
              <h2 className="text-3xl md:text-4xl font-bold glow-text">Tech Stack</h2>
              <p className="text-muted-foreground">
                Technologies I work with daily
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Backend Table */}
              <div className="space-y-1">
                <div className="px-6 py-3">
                  <h3 className="text-lg font-bold text-primary uppercase tracking-wider">Backend</h3>
                </div>
                {[
                  { name: "Python", level: 80 },
                  { name: "C#", level: 65 },
                  { name: "Java", level: 55 },
                  { name: "C", level: 40 },
                ].map((tech, index) => (
                  <div 
                    key={tech.name}
                    className="glass-card rounded-lg hover-lift group cursor-pointer overflow-hidden"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="px-6 py-4 relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                          {tech.name}
                        </span>
                        <span className="text-sm font-mono text-white/60 group-hover:text-white transition-colors">
                          {tech.level}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white/60 rounded-full transition-all duration-500 ease-out group-hover:bg-white"
                          style={{ 
                            width: `${tech.level}%`,
                            transitionDelay: '100ms'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Frontend Table */}
              <div className="space-y-1">
                <div className="px-6 py-3">
                  <h3 className="text-lg font-bold text-primary uppercase tracking-wider">Frontend</h3>
                </div>
                {[
                  { name: "HTML/CSS", level: 95 },
                  { name: "GTK Framework", level: 70 },
                  { name: "Qt Framework", level: 50 },
                ].map((tech, index) => (
                  <div 
                    key={tech.name}
                    className="glass-card rounded-lg hover-lift group cursor-pointer overflow-hidden"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="px-6 py-4 relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                          {tech.name}
                        </span>
                        <span className="text-sm font-mono text-white/60 group-hover:text-white transition-colors">
                          {tech.level}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white/60 rounded-full transition-all duration-500 ease-out group-hover:bg-white"
                          style={{ 
                            width: `${tech.level}%`,
                            transitionDelay: '100ms'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;