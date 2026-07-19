import type { Metadata } from "next";
export const metadata: Metadata = { title: { absolute: "Administration · GTA_Bratislava" }, robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) { return <main className="admin-theme min-h-screen bg-[#ecebe5] text-[#111310]">{children}</main>; }
