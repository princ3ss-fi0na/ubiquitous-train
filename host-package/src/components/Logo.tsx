import React from "react";
import logoImg from "../assets/cartech-logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = "md", showText = true }) => {
  const sizes = {
    sm: { img: 36, text: "text-base", sub: "text-[7px]" },
    md: { img: 44, text: "text-xl", sub: "text-[8px]" },
    lg: { img: 60, text: "text-2xl", sub: "text-[10px]" },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <img
        src={logoImg}
        alt="CarTech"
        width={s.img}
        height={s.img}
        style={{ objectFit: "contain" }}
        // #region agent log
        onLoad={(e) => {
          const img = e.currentTarget;
          fetch('http://127.0.0.1:7359/ingest/ffdf582f-c00f-428e-beaf-ff5f88c3abb0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6bb6d3'},body:JSON.stringify({sessionId:'6bb6d3',location:'Logo.tsx:onLoad',message:'cartech-logo-loaded',data:{naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,displayWidth:s.img,displayHeight:s.img,sizeVariant:size},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
        }}
        // #endregion
      />
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`${s.text} font-black tracking-wider text-white`}
            style={{ fontFamily: "'Arial Black', Arial, sans-serif" }}
          >
            CAR<span className="text-red-500">TECH</span>
          </span>
          <span
            className={`${s.sub} tracking-[0.25em] text-gray-500 uppercase font-semibold mt-0.5`}
          >
            AUTO PARTS
          </span>
        </div>
      )}
    </div>
  );
};
