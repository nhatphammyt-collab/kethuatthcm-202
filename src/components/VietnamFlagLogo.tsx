import React from "react";

type VietnamFlagLogoProps = {
  size?: number; // width in px
  className?: string;
};

const VietnamFlagLogo: React.FC<VietnamFlagLogoProps> = ({ size = 42, className = "" }) => {
  // Extract flag-specific class (hero-flag or header-flag) to apply to container
  const isHeroFlag = className.includes('hero-flag');
  const isHeaderFlag = className.includes('header-flag');
  const containerClass = className.replace(/hero-flag|header-flag/g, '').trim();
  
  return (
    <div className={`flag-logo-container ${containerClass}`}>
      <img
        src="/vietnam-flag.svg"
        alt="Quốc kỳ Việt Nam"
        className="flag-logo-image"
        style={{ width: size, height: (size * 2) / 3 }}
      />
    </div>
  );
};

export default VietnamFlagLogo;

