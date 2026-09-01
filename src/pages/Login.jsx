import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";

export default function Login() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role === "superadmin") navigate("/admin", { replace: true });
    else if (user.role === "franchise") navigate("/franchise", { replace: true });
  }, [user, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center p-4 font-sans selection:bg-[#F5A400]/30 selection:text-[#F5A400]">
      
      {/* ========================================================================= */}
      {/* FULL-SCREEN BACKGROUND VIDEO & CINEMATIC OVERLAYS                         */}
      {/* ========================================================================= */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover z-0 scale-[1.02] filter brightness-90"
      >
        <source src="/brand/login-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark Multi-layer Cinematic Tint & Vignette */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#080807]/90 via-[#080807]/60 to-[#080807]/80" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-radial-at-c from-transparent via-[#080807]/50 to-[#080807]/90" />

      {/* Ambient Gold Glows */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#F5A400]/15 blur-[160px] z-10" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-[#D99100]/15 blur-[140px] z-10" />

      {/* Decorative Gold Dots */}
      <div
        className="pointer-events-none absolute right-8 top-8 hidden h-32 w-32 opacity-20 z-20 lg:block"
        style={{
          backgroundImage: "radial-gradient(circle, #F5A400 1.5px, transparent 1.5px)",
          backgroundSize: "18px 18px",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-8 left-8 hidden h-32 w-32 opacity-20 z-20 lg:block"
        style={{
          backgroundImage: "radial-gradient(circle, #F5A400 1.5px, transparent 1.5px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* ========================================================================= */}
      {/* CENTERED FROSTED GLASS LOGIN CARD                                         */}
      {/* ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-30 w-full max-w-[440px] rounded-[32px] border border-white/15 bg-[#0D0C09]/70 p-7 sm:p-9 shadow-[0_30px_90px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
      >
        {/* Subtle Top Edge Highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F5A400]/50 to-transparent" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-2.5 flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 p-2.5 shadow-inner backdrop-blur-md">
            <img
              src="/brand/logo.png"
              alt="Egg ATM"
              className="h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(245,164,0,0.6)]"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="ml-2.5 text-2xl font-black tracking-wider text-white">
              EGG<span className="text-[#F5A400]">! </span>ATM
            </span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#F5A400] drop-shadow-sm">
            ANY TIME MUTTAI
          </p>
        </div>

        {/* Title */}
        <div className="mt-5 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-[1.65rem]">
            Welcome Back
          </h2>
          <p className="mt-1 text-xs font-medium text-white/60">
            Sign in to continue to your dashboard
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-red-500/30 bg-red-500/15 p-2.5 text-center text-xs font-medium text-red-300 backdrop-blur-md"
          >
            {error}
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/75">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/15 bg-white/[0.05] py-2.5 pl-10 pr-4 text-sm font-medium text-white placeholder-white/35 outline-none backdrop-blur-sm transition-all duration-200 focus:border-[#F5A400] focus:bg-white/[0.08] focus:ring-2 focus:ring-[#F5A400]/25"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/75">
              Password
            </label>
            <div className="relative">
              <Lock
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/15 bg-white/[0.05] py-2.5 pl-10 pr-10 text-sm font-medium text-white placeholder-white/35 outline-none backdrop-blur-sm transition-all duration-200 focus:border-[#F5A400] focus:bg-white/[0.08] focus:ring-2 focus:ring-[#F5A400]/25"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 transition-colors duration-200 hover:text-[#F5A400]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="amber"
              loading={loading}
              className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-[#F5A400] to-[#D99100] py-3 px-4 font-bold text-[#080807] shadow-lg shadow-[#F5A400]/25 transition-all duration-300 hover:brightness-110 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              Sign In
            </Button>
          </div>
        </form>

        {/* Access Footer */}
        <div className="mt-6 border-t border-white/10 pt-4 text-center">
          <p className="text-[11px] font-medium text-white/45">
            Superadmin &amp; Franchise Owner accounts only
          </p>
        </div>
      </motion.div>
    </div>
  );
}