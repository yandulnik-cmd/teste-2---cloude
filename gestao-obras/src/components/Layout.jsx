import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Building2, PlusCircle, TrendingUp,
  DollarSign, Landmark, Settings, Bell
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/obras", icon: Building2, label: "Obras" },
  { to: "/custos/novo", icon: PlusCircle, label: "Custo" },
  { to: "/faturamentos/novo", icon: TrendingUp, label: "Faturar" },
  { to: "/financeiro", icon: DollarSign, label: "Financeiro" },
  { to: "/bancos", icon: Landmark, label: "Bancos" },
  { to: "/configuracoes", icon: Settings, label: "Config" },
];

export default function Layout({ children }) {
  return (
    <div className="min-h-screen" style={{ background: "#020617" }}>
      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 px-6 py-4 flex justify-between items-center"
        style={{ background: "rgba(2,6,23,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "#6366f1", boxShadow: "0 8px 20px rgba(99,102,241,0.3)" }}>
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tighter uppercase italic text-white leading-none">
              Master<span style={{ color: "#6366f1" }}>Obra</span>
            </h1>
            <p className="text-[8px] font-bold uppercase tracking-[0.4em]" style={{ color: "#475569" }}>
              Executive Console
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <button className="relative w-9 h-9 flex items-center justify-center rounded-full transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Bell className="w-4 h-4" style={{ color: "#64748b" }} />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full border-2"
              style={{ background: "#f43f5e", borderColor: "#020617" }} />
          </button>
          <div className="w-9 h-9 rounded-full overflow-hidden"
            style={{ border: "2px solid rgba(99,102,241,0.3)" }}>
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Engineering" alt="User" />
          </div>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className="pb-32 px-4 md:px-8 lg:px-10 pt-6 max-w-7xl mx-auto">
        {children}
      </main>

      {/* FLOATING BOTTOM NAV ISLAND */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-4 py-3 rounded-[2rem]"
        style={{
          background: "rgba(15,23,42,0.85)",
          backdropFilter: "blur(30px)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.6)"
        }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className="group flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all"
            style={({ isActive }) => ({
              background: isActive ? "rgba(99,102,241,0.15)" : "transparent",
              color: isActive ? "#818cf8" : "#475569",
            })}
          >
            <Icon className="w-5 h-5 transition-all group-hover:scale-110" />
            <span className="text-[9px] font-bold uppercase tracking-wider leading-none">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
