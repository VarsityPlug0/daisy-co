import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "./Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ok = await isAuthenticated();
  if (!ok) redirect("/admin");
  return (
    <div className="flex h-screen overflow-hidden bg-[#111111]">
      <Sidebar />
      {/* min-w-0 prevents flex child from overflowing its allocated width */}
      <div className="flex-1 min-w-0 overflow-y-auto pt-[52px] lg:pt-0">
        {children}
      </div>
    </div>
  );
}
