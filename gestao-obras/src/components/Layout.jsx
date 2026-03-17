import { NavLink } from "react-router-dom";
import { Building2, DollarSign, LayoutDashboard, PlusCircle, Settings, TrendingUp, Landmark } from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/obras", icon: Building2, label: "Obras" },
  { to: "/custos/novo", icon: PlusCircle, label: "Lançar Custo" },
  { to: "/faturamentos/novo", icon: TrendingUp, label: "Faturar Medição" },
  { to: "/financeiro", icon: DollarSign, label: "Financeiro" },
  { to: "/bancos", icon: Landmark, label: "Bancos" },
  { to: "/configuracoes", icon: Settings, label: "Configurações" },
];

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="font-bold text-gray-900 text-sm leading-tight">Gestão de Obras</h1>
              <p className="text-xs text-gray-500">Sistema ERP</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">v1.0 — Gestão de Obras</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
