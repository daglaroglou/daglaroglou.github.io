import { Github, Bitcoin, Heart, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState } from "react";

const Donation = () => {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const donationMethods = [
    {
      name: "GitHub Sponsors",
      icon: Github,
      description: "Sponsor me on GitHub",
      link: "https://github.com/sponsors/daglaroglou",
      color: "text-purple-500",
    },
    {
      name: "PayPal",
      icon: DollarSign,
      description: "One-time donation via PayPal",
      link: "https://paypal.me/daglaroglou",
      color: "text-blue-500",
    },
    {
      name: "Revolut",
      icon: Heart,
      description: "Send via Revolut",
      link: "https://revolut.me/daglaroglouc",
      color: "text-cyan-500",
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
    <section className="py-20 px-4 bg-gradient-to-b from-background to-secondary/20">
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
                    <div className={`p-3 bg-primary/10 rounded-lg transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110 ${method.color}`}>
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

