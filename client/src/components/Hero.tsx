// src/components/Hero.tsx
import React from "react";

const Hero: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto pt-16 pb-12 px-4 flex flex-col items-center relative z-10">
      {/* Brand Logo - Animated Neon Border */}
      <div className="mb-10 relative group">
        <div className="relative rounded-2xl p-[3px] overflow-hidden">
          {/* Spinning Conic Gradient - Blue to Purple */}
          <div className="absolute inset-[-150%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3b82f6_0%,#a855f7_25%,#020617_50%,#3b82f6_75%,#3b82f6_100%)]" />
          {/* Blur for Neon Glow effect */}
          <div className="absolute inset-[-150%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3b82f6_0%,#a855f7_25%,#020617_50%,#3b82f6_75%,#3b82f6_100%)] blur-xl opacity-50" />
          {/* Inner Content (Logo) */}
          <div className="relative bg-[#020617] rounded-[14px] px-8 py-6 flex items-center justify-center">
            <img
              src="/speak-ai-logo.png"
              alt="Speakia AI"
              className="h-16 md:h-20 w-auto object-contain relative z-10"
            />
          </div>
        </div>
      </div>

      {/* Headings with Gradient */}
      <h1 className="text-4xl md:text-6xl font-bold text-center mb-4 tracking-tight">
        <span className="text-white">Crie seu influencer em poucos </span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#a855f7] drop-shadow-lg">
          cliques
        </span>
      </h1>
      <p className="text-lg text-textMuted text-center mb-12 font-light max-w-xl">
        Tutorial completo para usar o Speak Ai. <br className="hidden md:block" />
        <span className="text-purple-300/60">
          Do upload à publicação, passo a passo em vídeo.
        </span>
      </p>
    </div>
  );
};

export default Hero;
