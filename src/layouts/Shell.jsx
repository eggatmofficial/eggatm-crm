import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export default function Shell({ title, subtitle, navItems }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("crm_sidebar_collapsed") === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("crm_sidebar_collapsed", collapsed ? "1" : "0");
    } catch {
      /* noop */
    }
  }, [collapsed]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const activeLabel =
    navItems.find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
    )?.label || subtitle;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-app)] text-[var(--text-primary)]">
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-shrink-0 flex-col text-white transition-transform duration-300 ease-out lg:static lg:translate-x-0 lg:transition-[width] lg:duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-[84px]" : "lg:w-64"}`}
        style={{
          background:
            "linear-gradient(180deg, var(--sidebar-bg) 0%, var(--sidebar-bg-2) 100%)",
        }}
      >
        <div
          className={`flex items-center gap-3 px-5 py-6 ${
            collapsed ? "lg:justify-center lg:px-0" : ""
          }`}
        >
          <img
            src="/brand/logo.png"
            alt="Egg ATM"
            className="h-10 w-10 flex-shrink-0 rounded-xl bg-white object-contain p-1 shadow-lg shadow-black/30"
          />
          <div className={collapsed ? "lg:hidden" : ""}>
            <p className="text-sm font-semibold leading-tight">{title}</p>
            <p className="text-xs text-white/50">{subtitle}</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={item.label}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  collapsed ? "lg:justify-center lg:px-0" : ""
                } ${
                  isActive
                    ? "bg-[var(--amber)]/15 text-[var(--amber)]"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon size={18} className="flex-shrink-0" />
              <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={`mx-3 mb-2 hidden items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-white/50 transition hover:bg-white/5 hover:text-white lg:flex ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          <span className={collapsed ? "hidden" : ""}>Collapse</span>
        </button>

        <div
          className={`border-t border-white/10 px-4 py-4 ${
            collapsed ? "lg:px-2" : ""
          }`}
        >
          <button
            onClick={toggleTheme}
            className={`mb-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white ${
              collapsed ? "lg:justify-center" : ""
            }`}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            <span className={collapsed ? "lg:hidden" : ""}>
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          </button>

          <div className={collapsed ? "lg:hidden" : ""}>
            <p className="truncate text-sm font-medium">{user?.franchiseName || user?.name}</p>
            <p className="truncate text-xs capitalize text-white/50">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className={`mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white ${
              collapsed ? "lg:justify-center" : ""
            }`}
          >
            <LogOut size={16} className="flex-shrink-0" />
            <span className={collapsed ? "lg:hidden" : ""}>Sign out</span>
          </button>
        </div>
      </aside>

      {/* CONTENT COLUMN */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* MOBILE / SHARED TOP BAR */}
        <header className="flex flex-shrink-0 items-center gap-3 border-b border-slate-200 bg-[var(--bg-surface)] px-4 py-3 shadow-sm dark:border-white/10 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <img src="/brand/logo.png" alt="Egg ATM" className="h-8 w-8 rounded-lg bg-white object-contain p-0.5" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{activeLabel}</p>
          </div>
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
