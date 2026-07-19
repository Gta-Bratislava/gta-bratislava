import Image from "next/image";
import Link from "next/link";

export function Logo({ href = "/sk", inverse = false, large = false }: { href?: string; inverse?: boolean; large?: boolean }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-3" aria-label="GTA_Bratislava">
      <span className={`relative shrink-0 overflow-hidden rounded-full border border-acid/55 shadow-[0_0_22px_rgba(157,222,24,.12)] transition-transform group-hover:-rotate-2 ${large ? "h-20 w-20" : "h-12 w-12"}`}>
        <Image src="/brand/gta-bratislava-logo.jpg" alt="GTA Bratislava" fill sizes={large ? "80px" : "48px"} className="object-cover" priority={large} />
      </span>
      <span className={`leading-none ${large ? "hidden sm:block" : "hidden min-[380px]:block"}`}>
        <span className={`block font-black uppercase tracking-[-.03em] ${large ? "text-xl" : "text-[15px]"}`}>GTA <span className="text-acid">Bratislava</span></span>
        <span className={`mt-1 block font-extrabold uppercase tracking-[.16em] ${large ? "text-xs" : "text-[9px]"} ${inverse ? "text-white/55" : "text-black/45"}`}>Grand the auto</span>
      </span>
    </Link>
  );
}
