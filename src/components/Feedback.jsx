export function Loader({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--amber)]/20 border-t-[var(--amber)]" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      {Icon && <Icon size={36} className="text-slate-300 dark:text-slate-600" />}
      <p className="font-medium text-slate-600 dark:text-slate-300">{title}</p>
      {subtitle && <p className="text-sm text-slate-400 dark:text-slate-500">{subtitle}</p>}
    </div>
  );
}

export function Toast({ message, type = "success", onClose }) {
  if (!message) return null;
  const styles =
    type === "success"
      ? "bg-emerald-600"
      : type === "error"
      ? "bg-rose-600"
      : "bg-slate-800";

  return (
    <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 animate-fadeIn">
      <div
        className={`flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-xl ${styles}`}
      >
        {message}
        <button onClick={onClose} className="text-white/70 hover:text-white">
          ×
        </button>
      </div>
    </div>
  );
}
