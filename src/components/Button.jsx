export default function Button({
  children,
  variant = "primary",
  className = "",
  loading = false,
  disabled,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const variants = {
    primary:
      "bg-[var(--navy)] text-white hover:bg-[var(--navy-deep)] shadow-sm",
    amber:
      "bg-gradient-to-r from-[var(--amber)] to-[var(--amber-deep)] text-[var(--navy-deep)] hover:brightness-105 shadow-sm shadow-amber-500/20",
    outline:
      "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/5",
    ghost: "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };

  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
      )}
      {children}
    </button>
  );
}
