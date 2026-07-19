export function SectionHeading({ eyebrow, title, lead, light = false }: { eyebrow: string; title: string; lead?: string; light?: boolean }) {
  return <div className="mb-12 max-w-4xl"><div className={`eyebrow ${light ? "text-white/55" : "text-white/50"}`}>{eyebrow}</div><h2 className="section-title text-white">{title}</h2>{lead && <p className="lead mt-5">{lead}</p>}</div>;
}
