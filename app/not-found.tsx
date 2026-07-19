import Link from "next/link";

export default function NotFound() { return <main className="grid min-h-screen place-items-center bg-ink p-6 text-paper"><div className="text-center"><p className="text-sm font-black uppercase tracking-[.2em] text-acid">404</p><h1 className="mt-5 text-5xl font-black">Page not found</h1><Link href="/sk" className="btn btn-primary mt-8">GTA_Bratislava</Link></div></main>; }
