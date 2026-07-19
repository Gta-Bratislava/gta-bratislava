"use client";

import { X, ZoomIn } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function Gallery({ images, alt, zoomLabel }: { images: string[]; alt: string; zoomLabel: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  return (
    <div>
      <button onClick={() => setZoom(true)} className="group relative block aspect-[16/10] w-full overflow-hidden rounded-[22px] border border-acid/20 bg-[#111]" aria-label={zoomLabel}><Image src={images[active]} alt={`${alt} — ${active + 1}`} fill priority sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"/><span className="absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-xl bg-black/85 text-acid shadow"><ZoomIn size={20}/></span></button>
      <div className="mt-3 grid grid-cols-3 gap-3">{images.map((image, index) => <button key={image} onClick={() => setActive(index)} aria-label={`${alt} ${index + 1}`} className={`relative aspect-[16/10] overflow-hidden rounded-xl border-2 ${active === index ? "border-acid" : "border-transparent"}`}><Image src={image} alt="" fill sizes="30vw" className="object-cover"/></button>)}</div>
      {zoom && <div className="fixed inset-0 z-[80] grid place-items-center bg-black/90 p-4" role="dialog" aria-modal="true"><button onClick={() => setZoom(false)} className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full bg-white text-black" aria-label="Close"><X/></button><div className="relative h-[85vh] w-[92vw]"><Image src={images[active]} alt={`${alt} — ${active + 1}`} fill sizes="100vw" className="object-contain"/></div></div>}
    </div>
  );
}
