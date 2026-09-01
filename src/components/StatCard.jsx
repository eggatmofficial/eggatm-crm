export default function StatCard({ icon: Icon, label, value, accent = "navy" }) {
  const accents = {
    navy: "bg-[var(--navy)]/10 text-[var(--navy)] dark:bg-white/10 dark:text-white",
    amber: "bg-amber-100 text-amber-700 dark:bg-[var(--amber)]/15 dark:text-[var(--amber)]",
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-white/10 dark:bg-[var(--bg-surface)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
        {Icon && (
          <div className={`rounded-xl p-3 ${accents[accent]}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
}
