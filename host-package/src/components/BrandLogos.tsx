import React from "react";

import toyotaPng from "../assets/brands/toyota.png";
import nissanPng from "../assets/brands/nissan.png";
import mazdaPng from "../assets/brands/mazda.png";
import mitsubishiPng from "../assets/brands/mitsubishi.png";
import hondaPng from "../assets/brands/honda.png";
import lexusPng from "../assets/brands/lexus.png";

import volkswagenPng from "../assets/brands/volkswagen.png";
import bmwPng from "../assets/brands/bmw.png";
import mercedesPng from "../assets/brands/mercedes.png";
import audiPng from "../assets/brands/audi.png";
import opelPng from "../assets/brands/opel.png";
import porschePng from "../assets/brands/porsche.png";

import kiaPng from "../assets/brands/kia.png";
import hyundaiPng from "../assets/brands/hyundai.png";
import genesisPng from "../assets/brands/genesis.png";

import chevroletPng from "../assets/brands/chevrolet.png";
import fordPng from "../assets/brands/ford.png";
import jeepPng from "../assets/brands/jeep.png";
import dodgePng from "../assets/brands/dodge.png";

import renaultPng from "../assets/brands/renault.png";
import peugeotPng from "../assets/brands/peugeot.png";
import citroenPng from "../assets/brands/citroen.png";

import skodaPng from "../assets/brands/skoda.png";
import fiatPng from "../assets/brands/fiat.png";
import alfaromeoPng from "../assets/brands/alfaromeo.png";

import ladaPng from "../assets/brands/lada.png";
import uazPng from "../assets/brands/uaz.png";
import gazPng from "../assets/brands/gaz.png";
import kamazPng from "../assets/brands/kamaz.png";

import bydPng from "../assets/brands/byd.png";
import geelyPng from "../assets/brands/geely.png";
import cheryPng from "../assets/brands/chery.png";
import greatwallPng from "../assets/brands/greatwall.png";
import nioPng from "../assets/brands/nio.png";
import xpengPng from "../assets/brands/xpeng.png";
import liPng from "../assets/brands/li.png";
import zeekrPng from "../assets/brands/zeekr.png";

interface BrandLogoProps {
  size?: number;
}

const brandPngMap: Record<string, string> = {
  toyota: toyotaPng,
  nissan: nissanPng,
  mazda: mazdaPng,
  mitsubishi: mitsubishiPng,
  honda: hondaPng,
  lexus: lexusPng,
  volkswagen: volkswagenPng,
  bmw: bmwPng,
  mercedes: mercedesPng,
  audi: audiPng,
  opel: opelPng,
  porsche: porschePng,
  kia: kiaPng,
  hyundai: hyundaiPng,
  genesis: genesisPng,
  chevrolet: chevroletPng,
  ford: fordPng,
  jeep: jeepPng,
  dodge: dodgePng,
  renault: renaultPng,
  peugeot: peugeotPng,
  citroen: citroenPng,
  skoda: skodaPng,
  fiat: fiatPng,
  alfaromeo: alfaromeoPng,
  lada: ladaPng,
  uaz: uazPng,
  gaz: gazPng,
  kamaz: kamazPng,
  byd: bydPng,
  geely: geelyPng,
  chery: cheryPng,
  greatwall: greatwallPng,
  nio: nioPng,
  xpeng: xpengPng,
  li: liPng,
  zeekr: zeekrPng,
};

function makeBrandComponent(brandId: string, label: string): React.FC<BrandLogoProps> {
  const src = brandPngMap[brandId];
  if (!src) {
    return ({ size = 40 }) => (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center bg-gray-800 rounded-lg text-gray-400 text-xs font-bold"
      >
        {label.slice(0, 2).toUpperCase()}
      </div>
    );
  }
  return ({ size = 40 }) => (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center"
    >
      <img
        src={src}
        alt={label}
        // #region agent log
        onLoad={(e) => {
          const img = e.currentTarget;
          fetch('http://127.0.0.1:7359/ingest/ffdf582f-c00f-428e-beaf-ff5f88c3abb0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6bb6d3'},body:JSON.stringify({sessionId:'6bb6d3',location:'BrandLogos.tsx:onLoad',message:'brand-img-loaded',data:{brandId,label,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,aspectRatio:+(img.naturalWidth/img.naturalHeight).toFixed(2),displaySize:size,computedMaxWH:size*0.82},timestamp:Date.now(),hypothesisId:'H2-H5'})}).catch(()=>{});
        }}
        // #endregion
        style={{
          maxWidth: size * 0.82,
          maxHeight: size * 0.82,
          objectFit: "contain",
        }}
        loading="lazy"
      />
    </div>
  );
}

export const BrandSVGs: Record<string, React.FC<BrandLogoProps>> = Object.fromEntries(
  Object.entries(brandPngMap).map(([id]) => [
    id,
    makeBrandComponent(id, id),
  ])
);

BrandSVGs.avatr = makeBrandComponent("avatr", "Avatr");
