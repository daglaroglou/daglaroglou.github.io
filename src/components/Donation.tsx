import { Bitcoin, Heart, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { GitHubMark } from "@/components/icons/GitHubMark";
import { useState, type ComponentType } from "react";

/** PayPal mark (Simple Icons geometry); brand blues per PayPal guidelines. */
function PayPalMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#003087"
        d="M7.016 19.198h-4.2a.562.562 0 0 1-.555-.65L5.093.584A.692.692 0 0 1 5.776 0h7.222c3.417 0 5.904 2.488 5.846 5.5-.006.25-.027.5-.066.747A6.794 6.794 0 0 1 12.071 12H8.743a.69.69 0 0 0-.682.583l-.325 2.056-.013.083-.692 4.39-.015.087z"
      />
      <path
        fill="#009CDE"
        d="M19.79 6.142c-.01.087-.01.175-.023.261a7.76 7.76 0 0 1-7.695 6.598H9.007l-.283 1.795-.013.083-.692 4.39-.134.843-.014.088H6.86l-.497 3.15a.562.562 0 0 0 .555.65h3.612c.34 0 .63-.249.683-.585l.952-6.031a.692.692 0 0 1 .683-.584h2.126a6.793 6.793 0 0 0 6.707-5.752c.306-1.95-.466-3.744-1.89-4.906z"
      />
    </svg>
  );
}

/** Revolut mark (Simple Icons geometry). */
function RevolutMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path
        fill="currentColor"
        d="M20.9133 6.9566C20.9133 3.1208 17.7898 0 13.9503 0H2.424v3.8605h10.9782c1.7376 0 3.177 1.3651 3.2087 3.043.016.84-.2994 1.633-.8878 2.2324-.5886.5998-1.375.9303-2.2144.9303H9.2322a.2756.2756 0 0 0-.2755.2752v3.431c0 .0585.018.1142.052.1612L16.2646 24h5.3114l-7.2727-10.094c3.6625-.1838 6.61-3.2612 6.61-6.9494zM6.8943 5.9229H2.424V24h4.4704z"
      />
    </svg>
  );
}

type DonationIcon = ComponentType<{ className?: string }> | LucideIcon;

type DonationMethod = {
  name: string;
  icon: DonationIcon;
  description: string;
  link: string;
  color: string;
};

const Donation = () => {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const donationMethods: DonationMethod[] = [
    {
      name: "GitHub Sponsors",
      icon: GitHubMark,
      description: "Sponsor me on GitHub",
      link: "https://github.com/sponsors/daglaroglou",
      color: "text-purple-500",
    },
    {
      name: "PayPal",
      icon: PayPalMark,
      description: "One-time donation via PayPal",
      link: "https://paypal.me/daglaroglou",
      color: "",
    },
    {
      name: "Revolut",
      icon: RevolutMark,
      description: "Send via Revolut",
      link: "https://revolut.me/daglaroglouc",
      color: "text-foreground",
    },
    {
      name: "Crypto",
      icon: Bitcoin,
      description: "Donate with cryptocurrency",
      link: "#crypto",
      color: "text-orange-500",
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 animate-pulse-glow">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 glow-text">
            Support My Work
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            If you find my projects helpful or enjoy my content, consider supporting me. 
            Your donation helps me create more open-source projects and content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {donationMethods.map((method, index) => {
            const Icon = method.icon;
            const isCrypto = method.link === "#crypto";
            
            const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
              if (isCrypto) {
                e.preventDefault();
                const cryptoSection = document.getElementById("crypto");
                if (cryptoSection) {
                  // Smooth scroll to crypto section immediately
                  cryptoSection.scrollIntoView({ 
                    behavior: "smooth", 
                    block: "center",
                    inline: "nearest"
                  });
                  
                  // Trigger highlight animation after scroll starts
                  setTimeout(() => {
                    setIsHighlighted(true);
                  }, 300);
                  
                  // Remove highlight after animation
                  setTimeout(() => {
                    setIsHighlighted(false);
                  }, 2500);
                }
              }
            };
            
            return (
              <a
                key={method.name}
                href={method.link}
                target={isCrypto ? undefined : "_blank"}
                rel={isCrypto ? undefined : "noopener noreferrer"}
                onClick={handleClick}
                className="block group"
              >
                <Card 
                  className="glass-card hover-lift p-6 h-full transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 bg-primary/10 rounded-lg transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110${method.color ? ` ${method.color}` : ""}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                        {method.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </a>
            );
          })}
        </div>

        {/* Crypto addresses (expandable) */}
        <Card 
          id="crypto" 
          className={`glass-card p-6 transition-all duration-500 ${
            isHighlighted 
              ? 'ring-2 ring-primary shadow-[0_0_30px_hsl(var(--primary)/0.5)] scale-[1.02]' 
              : ''
          }`}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bitcoin className={`w-5 h-5 text-orange-500 transition-transform duration-500 ${
              isHighlighted ? 'scale-125 rotate-12' : ''
            }`} />
            Cryptocurrency Addresses
          </h3>
          <div className="space-y-3">
            <div className={`space-y-1 transition-all duration-500 ${
              isHighlighted ? 'translate-x-2' : ''
            }`}>
              <p className="text-sm font-medium text-muted-foreground">Bitcoin (BTC)</p>
              <code className={`block text-xs bg-secondary p-3 rounded-lg break-all font-mono transition-all duration-500 ${
                isHighlighted ? 'bg-primary/10 border border-primary/20' : ''
              }`}>
                bc1qp62x7ehcvddyf6yw4ye5dy9uw8hllxhah3u447
              </code>
            </div>
            <div className={`space-y-1 transition-all duration-500 ${
              isHighlighted ? 'translate-x-2' : ''
            }`} style={{ transitionDelay: isHighlighted ? '100ms' : '0ms' }}>
              <p className="text-sm font-medium text-muted-foreground">Ethereum (ETH)</p>
              <code className={`block text-xs bg-secondary p-3 rounded-lg break-all font-mono transition-all duration-500 ${
                isHighlighted ? 'bg-primary/10 border border-primary/20' : ''
              }`}>
                0xcD6782ADccb748ae13a08fd2A237dABE97Df0074
              </code>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Please verify addresses before sending. Cryptocurrency transactions are irreversible.
          </p>
        </Card>

        {/* Thank you message */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground italic">
            Thank you for your support! Every contribution is greatly appreciated. 💙
          </p>
        </div>
      </div>
    </section>
  );
};

export default Donation;

