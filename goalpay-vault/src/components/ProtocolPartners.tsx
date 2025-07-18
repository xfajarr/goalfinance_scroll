import { useEffect, useState } from 'react';

export const ProtocolPartners = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const partners = [
    {
      name: "Aave",
      logoSrc: "/aave-aave-logo.svg",
      logoAlt: "Aave Protocol Logo"
    },
    {
      name: "Li.Fi",
      logoSrc: "/logo_lifi_light_horizontal.png",
      logoAlt: "Li.Fi Protocol Logo"
    },
    {
      name: "Morpho",
      logoSrc: "/Morpho-logo-horizontal-lightmode.svg",
      logoAlt: "Morpho Protocol Logo"
    },
    {
      name: "Aave",
      logoSrc: "/aave-aave-logo.svg",
      logoAlt: "Aave Protocol Logo"
    },
    {
      name: "Li.Fi",
      logoSrc: "/logo_lifi_light_horizontal.png",
      logoAlt: "Li.Fi Protocol Logo"
    },
    {
      name: "Morpho",
      logoSrc: "/Morpho-logo-horizontal-lightmode.svg",
      logoAlt: "Morpho Protocol Logo"
    }
  ];

  // Duplicate the array to create seamless loop
  const duplicatedPartners = [...partners, ...partners];

  return (
    <div className={`mt-16 space-y-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-fredoka font-bold text-goal-text-primary mb-3">
          Protocol Partners
        </h2>
        {/* <p className="text-base font-inter text-goal-text-secondary max-w-xl mx-auto">
          Trusted by leading DeFi protocols to provide secure and reliable yield generation.
        </p> */}
      </div>

      {/* Animated Partners Carousel */}
      <div className="relative overflow-hidden py-4 scroll-container">
        <div className="flex animate-scroll-left space-x-6 pl-6" style={{ width: 'max-content' }}>
          {duplicatedPartners.map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className="flex-shrink-0 bg-goal-accent/60 backdrop-blur-sm border border-goal-border/50 rounded-2xl p-4 md:p-6 min-w-[200px] md:min-w-[240px] hover:scale-[1.02] transition-all duration-200"
            >
              <div className="flex items-center justify-center space-x-4">
                <div className="w-28 h-20 flex items-center justify-center">
                  <img
                    src={partner.logoSrc}
                    alt={partner.logoAlt}
                    className="max-w-full max-h-full object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
                {/* <h3 className="font-fredoka font-bold text-goal-heading text-lg">
                  {partner.name}
                </h3> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
